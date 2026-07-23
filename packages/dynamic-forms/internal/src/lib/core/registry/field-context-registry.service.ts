import { inject, Injectable, isSignal, Signal, untracked } from '@angular/core';
import { ChildFieldContext, FieldContext, FieldTree, ReadonlyFieldState } from '@angular/forms/signals';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { EXTERNAL_DATA } from '../../models/field-signal-context.token';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { RootFormRegistryService } from './root-form-registry.service';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { DEPRECATION_WARNING_TRACKER } from '../../utils/deprecation-warning-tracker';
import { getNestedValue } from '../expressions/value-utils';
import { readFieldStateInfo, createFormFieldStateMap } from '../derivation/field-state-extractor';
import { safeReadPathKeys } from '../../utils/safe-read-path-keys';
import { createFieldValueProxy } from './field-value-proxy';

function isChildFieldContext<TValue>(context: FieldContext<TValue>): context is ChildFieldContext<TValue> {
  return 'key' in context && isSignal(context.key);
}

/** Extracts the FieldState from a FieldContext using the public `.state` property. */
function extractFieldState(fieldContext: FieldContext<unknown>): ReadonlyFieldState<unknown> | undefined {
  return untracked(() => {
    if (!fieldContext || !('state' in fieldContext)) return undefined;
    return fieldContext.state;
  });
}

/** Navigates a root FieldTree down to a specific array item's subtree, structurally. */
function navigateArrayItemTree(root: FieldTree<unknown> | undefined, arrayKey: string, index: number): FieldTree<unknown> | undefined {
  let node: unknown = root;
  for (const segment of arrayKey.split('.')) {
    if (node == null) return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  if (node == null) return undefined;
  // Array item children are indexed numerically on the same node shape as named children.
  return (node as Record<number, unknown>)[index] as FieldTree<unknown> | undefined;
}

/** Detects whether a field lives inside an array by examining its `pathKeys`. */
function detectArrayScope(pathKeys: readonly string[]): { arrayKey: string; index: number; localKey: string } | undefined {
  // Need at least 3 segments: arrayKey, index, fieldKey
  if (pathKeys.length < 3) return undefined;

  // Walk from the end to find the nearest array context.
  // pathKeys looks like ['addresses', '0', 'street'] or
  // ['nested', 'addresses', '1', 'city']
  for (let i = pathKeys.length - 2; i >= 1; i--) {
    const maybeIndex = Number(pathKeys[i]);
    if (Number.isInteger(maybeIndex) && maybeIndex >= 0) {
      return {
        arrayKey: pathKeys.slice(0, i).join('.'),
        index: maybeIndex,
        localKey: pathKeys[pathKeys.length - 1],
      };
    }
  }

  return undefined;
}

/**
 * Service that provides field evaluation context by combining
 * field context with root form registry information.
 */
@Injectable()
export class FieldContextRegistryService {
  private rootFormRegistry = inject(RootFormRegistryService);
  private logger = inject(DynamicFormLogger);
  private deprecationTracker = inject(DEPRECATION_WARNING_TRACKER, { optional: true });
  private externalDataSignal = inject(EXTERNAL_DATA, { optional: true });

  /**
   * Creates an evaluation context for a field by combining:
   * - The field's current value
   * - The root form value from the registry
   * - The field path (if available from form context)
   * - Custom functions (if provided)
   */
  createEvaluationContext<TValue>(
    fieldContext: FieldContext<TValue>,
    customFunctions?: Record<string, (context: EvaluationContext) => unknown>,
  ): EvaluationContext {
    // Use untracked() to read the field value WITHOUT creating a reactive dependency.
    // This prevents infinite loops when logic functions are evaluated inside computed signals.
    const fieldValue = untracked(() => fieldContext.value());

    // Get form value wrapped in untracked() to prevent reactive dependencies.
    // This allows validators and dynamic values to access form values without
    // causing infinite loops.
    const rootFormValue = untracked(() => this.rootFormRegistry.formValue());
    const localKey = this.extractFieldPath(fieldContext);
    const pathKeys = safeReadPathKeys(fieldContext);
    const arrayScope = detectArrayScope(pathKeys);

    if (arrayScope) {
      return this.buildArrayScopedContext(rootFormValue, arrayScope, fieldValue, customFunctions, false, fieldContext);
    }

    // Use getters for externalData/fieldState/formFieldState to defer signal reads
    // until the expression actually accesses them. Validators that only use fieldValue
    // will never trigger these getters, so they subscribe to nothing extra and avoid
    // reactive cycles in Angular's internal signal graph (validator → state → valid → validator).
    const rootFormSignal = this.rootFormRegistry.rootForm;
    const resolveExternalData = () => this.resolveExternalData();
    return {
      fieldValue,
      formValue: rootFormValue,
      fieldPath: localKey,
      customFunctions: customFunctions || {},
      logger: this.logger,
      deprecationTracker: this.deprecationTracker ?? undefined,
      get externalData() {
        return resolveExternalData();
      },
      get fieldState() {
        return readFieldStateInfo(extractFieldState(fieldContext), false);
      },
      get formFieldState() {
        return createFormFieldStateMap(untracked(rootFormSignal) as FieldTree<unknown>, false);
      },
    };
  }

  /** Extracts the field path (key) for a given field context. */
  private extractFieldPath(fieldContext: FieldContext<unknown>): string {
    if (isChildFieldContext(fieldContext)) {
      try {
        return String(fieldContext.key());
      } catch (error) {
        this.logger.warn('Unable to extract field key:', error);
      }
    }

    // For root fields or when key is not available
    return '';
  }

  /** Builds an evaluation context scoped to a specific array item. */
  private buildArrayScopedContext<TValue>(
    rootFormValue: Record<string, unknown>,
    arrayScope: { arrayKey: string; index: number; localKey: string },
    fieldValue: TValue,
    customFunctions: Record<string, (context: EvaluationContext) => unknown> | undefined,
    reactive: boolean,
    fieldContext?: FieldContext<unknown>,
  ): EvaluationContext {
    const { arrayKey, index, localKey } = arrayScope;

    // Navigate to the array (supports nested paths like 'nested.addresses')
    const arrayData = getNestedValue(rootFormValue, arrayKey);
    let scopedFormValue: Record<string, unknown> | undefined;

    if (Array.isArray(arrayData) && index >= 0 && index < arrayData.length) {
      const item = arrayData[index];
      if (item != null && typeof item === 'object') {
        scopedFormValue = item as Record<string, unknown>;
      }
    }

    // Use getters to defer fieldState/formFieldState construction.
    // Same rationale as createEvaluationContext — avoids reactive cycles
    // when expressions don't actually access these properties.
    const rootFormSignal = this.rootFormRegistry.rootForm;
    const resolveExternalData = () => this.resolveExternalData();
    const fieldStateGetter = fieldContext ? () => readFieldStateInfo(extractFieldState(fieldContext), reactive) : () => undefined;
    const formFieldStateGetter = () =>
      createFormFieldStateMap((reactive ? rootFormSignal() : untracked(rootFormSignal)) as FieldTree<unknown>, reactive);

    // Fall back to root form value if array item lookup fails
    if (!scopedFormValue) {
      return {
        fieldValue,
        formValue: rootFormValue,
        fieldPath: localKey,
        customFunctions: customFunctions || {},
        logger: this.logger,
        deprecationTracker: this.deprecationTracker ?? undefined,
        get externalData() {
          return resolveExternalData();
        },
        get fieldState() {
          return fieldStateGetter();
        },
        get formFieldState() {
          return formFieldStateGetter();
        },
      };
    }

    return {
      fieldValue,
      formValue: scopedFormValue,
      rootFormValue,
      arrayIndex: index,
      arrayPath: arrayKey,
      fieldPath: `${arrayKey}.${index}.${localKey}`,
      customFunctions: customFunctions || {},
      logger: this.logger,
      deprecationTracker: this.deprecationTracker ?? undefined,
      get externalData() {
        return resolveExternalData();
      },
      get fieldState() {
        return fieldStateGetter();
      },
      get formFieldState() {
        return formFieldStateGetter();
      },
    };
  }

  /**
   * Builds a REACTIVE evaluation context scoped to a specific array item, fine-grained:
   * `formValue`/`rootFormValue` are proxies over the FieldTree so a condition subscribes
   * only to the fields it actually reads, instead of the whole-form value.
   */
  private buildReactiveArrayScopedContext<TValue>(
    arrayScope: { arrayKey: string; index: number; localKey: string },
    fieldValue: TValue,
    customFunctions: Record<string, (context: EvaluationContext) => unknown> | undefined,
    fieldContext?: FieldContext<unknown>,
  ): EvaluationContext {
    const { arrayKey, index, localKey } = arrayScope;
    const rootFormSignal = this.rootFormRegistry.rootForm;
    const resolveExternalData = () => this.resolveExternalData();
    const fieldStateGetter = fieldContext ? () => readFieldStateInfo(extractFieldState(fieldContext), true) : () => undefined;
    const formFieldStateGetter = () => createFormFieldStateMap(rootFormSignal() as FieldTree<unknown>, true);

    // Structural check only — untracked so it doesn't subscribe to the whole form.
    const hasValidItem = untracked(() => {
      const arrayData = getNestedValue(this.rootFormRegistry.formValue(), arrayKey);
      if (!Array.isArray(arrayData) || index < 0 || index >= arrayData.length) return false;
      const item = arrayData[index];
      return item != null && typeof item === 'object';
    });

    const rootFormValueProxy = createFieldValueProxy(
      () => rootFormSignal() as FieldTree<unknown> | undefined,
      () => this.rootFormRegistry.formValue(),
    );

    if (!hasValidItem) {
      return {
        fieldValue,
        formValue: rootFormValueProxy,
        fieldPath: localKey,
        customFunctions: customFunctions || {},
        logger: this.logger,
        deprecationTracker: this.deprecationTracker ?? undefined,
        get externalData() {
          return resolveExternalData();
        },
        get fieldState() {
          return fieldStateGetter();
        },
        get formFieldState() {
          return formFieldStateGetter();
        },
      };
    }

    const itemFormValueProxy = createFieldValueProxy(
      () => navigateArrayItemTree(rootFormSignal() as FieldTree<unknown> | undefined, arrayKey, index),
      () => {
        const arrayData = getNestedValue(this.rootFormRegistry.formValue(), arrayKey);
        const item = Array.isArray(arrayData) ? arrayData[index] : undefined;
        return item != null && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      },
    );

    return {
      fieldValue,
      formValue: itemFormValueProxy,
      rootFormValue: rootFormValueProxy,
      arrayIndex: index,
      arrayPath: arrayKey,
      fieldPath: `${arrayKey}.${index}.${localKey}`,
      customFunctions: customFunctions || {},
      logger: this.logger,
      deprecationTracker: this.deprecationTracker ?? undefined,
      get externalData() {
        return resolveExternalData();
      },
      get fieldState() {
        return fieldStateGetter();
      },
      get formFieldState() {
        return formFieldStateGetter();
      },
    };
  }

  /**
   * Resolves external data signals to their current values.
   *
   * Always reads reactively. Unlike the field value and form value (which are
   * read untracked to break the validator -> state -> valid -> validator cycle),
   * externalData is one-directional external input that validation output can
   * never feed back into, so tracking it cannot cause a cycle. Reading it
   * reactively is what lets dynamic values and validators bound to externalData
   * update when it changes.
   *
   * @returns Record of resolved external data values, or undefined if no external data.
   */
  private resolveExternalData(): Record<string, unknown> | undefined {
    const externalDataSignal = this.externalDataSignal;
    if (!externalDataSignal) return undefined;

    const externalDataRecord = externalDataSignal();

    if (!externalDataRecord) {
      return undefined;
    }

    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(externalDataRecord)) {
      if (!isSignal(value)) {
        throw new DynamicFormError(`externalData["${key}"] must be a Signal. Got: ${typeof value}. Wrap it with signal(yourValue).`);
      }
      resolved[key] = (value as Signal<unknown>)();
    }

    return resolved;
  }

  /** Creates a REACTIVE evaluation context for logic functions. */
  createReactiveEvaluationContext<TValue>(
    fieldContext: FieldContext<TValue>,
    customFunctions?: Record<string, (context: EvaluationContext) => unknown>,
  ): EvaluationContext {
    const fieldValue = fieldContext.value();
    const pathKeys = safeReadPathKeys(fieldContext);
    const arrayScope = detectArrayScope(pathKeys);

    if (arrayScope) {
      return this.buildReactiveArrayScopedContext(arrayScope, fieldValue, customFunctions, fieldContext);
    }

    const localKey = this.extractFieldPath(fieldContext);
    const rootFormSignal = this.rootFormRegistry.rootForm;
    const resolveExternalData = () => this.resolveExternalData();

    // Fine-grained form value: reading `formValue.<field>` subscribes to just that
    // field, so changing one field doesn't re-evaluate every field's logic.
    const formValueProxy = createFieldValueProxy(
      () => rootFormSignal() as FieldTree<unknown> | undefined,
      () => this.rootFormRegistry.formValue(),
    );

    return {
      fieldValue,
      formValue: formValueProxy,
      fieldPath: localKey,
      customFunctions: customFunctions || {},
      logger: this.logger,
      deprecationTracker: this.deprecationTracker ?? undefined,
      get externalData() {
        return resolveExternalData();
      },
      get fieldState() {
        return readFieldStateInfo(extractFieldState(fieldContext), true);
      },
      get formFieldState() {
        return createFormFieldStateMap(rootFormSignal() as FieldTree<unknown>, true);
      },
    };
  }

  /**
   * Creates an evaluation context for display-only components (text fields, pages)
   * that don't have their own FieldContext.
   *
   * @param fieldPath - The key/path of the display-only component
   * @param customFunctions - Optional custom functions for expression evaluation
   * @param arrayScope - When the element lives inside an array item, scopes `formValue`
   *        to that item so conditions resolve against sibling fields, matching leaf fields.
   */
  createDisplayOnlyContext(
    fieldPath: string,
    customFunctions?: Record<string, (context: EvaluationContext) => unknown>,
    arrayScope?: { arrayKey: string; index: number; localKey: string },
  ): EvaluationContext {
    if (arrayScope) {
      return this.buildReactiveArrayScopedContext(arrayScope, undefined, customFunctions);
    }

    const rootFormSignal = this.rootFormRegistry.rootForm;
    const resolveExternalData = () => this.resolveExternalData();

    // Fine-grained form value, same as createReactiveEvaluationContext: a page or
    // container condition subscribes only to the fields it actually reads.
    const formValueProxy = createFieldValueProxy(
      () => rootFormSignal() as FieldTree<unknown> | undefined,
      () => this.rootFormRegistry.formValue(),
    );

    return {
      fieldValue: undefined,
      formValue: formValueProxy,
      fieldPath,
      customFunctions: customFunctions || {},
      logger: this.logger,
      deprecationTracker: this.deprecationTracker ?? undefined,
      get externalData() {
        return resolveExternalData();
      },
      get formFieldState() {
        return createFormFieldStateMap(rootFormSignal() as FieldTree<unknown>, true);
      },
    };
  }
}
