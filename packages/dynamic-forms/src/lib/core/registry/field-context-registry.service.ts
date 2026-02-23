import { inject, Injectable, isSignal, Signal, untracked } from '@angular/core';
import { ChildFieldContext, FieldContext, FieldState, FieldTree } from '@angular/forms/signals';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { EXTERNAL_DATA } from '../../models/field-signal-context.token';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { RootFormRegistryService } from './root-form-registry.service';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { DEPRECATION_WARNING_TRACKER } from '../../utils/deprecation-warning-tracker';
import { getNestedValue } from '../expressions/value-utils';
import { readFieldStateInfo, createFormFieldStateMap } from '../derivation/field-state-extractor';
import { safeReadPathKeys } from '../../utils/safe-read-path-keys';

function isChildFieldContext<TValue>(context: FieldContext<TValue>): context is ChildFieldContext<TValue> {
  return 'key' in context && isSignal(context.key);
}

/**
 * Extracts the FieldState from a FieldContext using the public `.state` property.
 *
 * FieldContext.state is a FieldState object that has all signal properties
 * (dirty, touched, valid, etc.) needed for field state snapshots.
 *
 * IMPORTANT: Always reads with `untracked()` because accessing `.state` on a
 * FieldContext can trigger reactive reads inside Angular's internal computation
 * graph. Without `untracked()`, validators would cycle (validator → state → valid
 * → validator) and logic conditions like `hidden()` would cycle (hidden → state →
 * hidden). The FieldState object reference is stable — individual signal properties
 * within it are read reactively or untracked by the Proxy as needed.
 */
function extractFieldState(fieldContext: FieldContext<unknown>): FieldState<unknown> | undefined {
  return untracked(() => {
    if (!fieldContext || !('state' in fieldContext)) return undefined;
    return fieldContext.state;
  });
}

/**
 * Detects whether a field lives inside an array by examining its `pathKeys`.
 *
 * Array item fields have paths like `['addresses', '0', 'street']` where
 * a numeric segment indicates an array index. Returns the array key and
 * numeric index when detected, or `undefined` for non-array fields.
 *
 * For nested arrays (e.g., `['orders', '0', 'items', '1', 'name']`), walks backwards
 * to find the innermost array context — scoping `formValue` to that item.
 * `localKey` is always the last segment (the field's own key within its parent item).
 */
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
 *
 * This service should be provided at the component level to ensure proper
 * isolation between different form instances.
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

    // Use getters for fieldState/formFieldState to defer signal reads until
    // the expression actually accesses them. Validators that only use fieldValue
    // will never trigger these getters, avoiding reactive cycles in Angular's
    // internal signal graph (validator → state → valid → validator).
    const rootFormSignal = this.rootFormRegistry.rootForm;
    return {
      fieldValue,
      formValue: rootFormValue,
      fieldPath: localKey,
      customFunctions: customFunctions || {},
      externalData: this.resolveExternalData(false),
      logger: this.logger,
      deprecationTracker: this.deprecationTracker ?? undefined,
      get fieldState() {
        return readFieldStateInfo(extractFieldState(fieldContext), false);
      },
      get formFieldState() {
        return createFormFieldStateMap(untracked(rootFormSignal) as FieldTree<unknown>, false);
      },
    };
  }

  /**
   * Extracts the field path (key) for a given field context.
   */
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

  /**
   * Builds an evaluation context scoped to a specific array item.
   *
   * When a field lives inside an array (e.g., `addresses.0.street`), its logic conditions
   * need `formValue` scoped to the array item so that `fieldValue` lookups like
   * `hasApartment` resolve against the item rather than the root form.
   *
   * Falls back to root form behavior when the array data is missing or the index is
   * out of bounds.
   */
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
        externalData: this.resolveExternalData(reactive),
        logger: this.logger,
        deprecationTracker: this.deprecationTracker ?? undefined,
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
      externalData: this.resolveExternalData(reactive),
      logger: this.logger,
      deprecationTracker: this.deprecationTracker ?? undefined,
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
   * @param reactive - If true, reads signals reactively (creates dependencies).
   *                   If false, reads signals with untracked() (no dependencies).
   * @returns Record of resolved external data values, or undefined if no external data.
   */
  private resolveExternalData(reactive: boolean): Record<string, unknown> | undefined {
    const externalDataSignal = this.externalDataSignal;
    if (!externalDataSignal) return undefined;

    const externalDataRecord = reactive ? externalDataSignal() : untracked(() => externalDataSignal());

    if (!externalDataRecord) {
      return undefined;
    }

    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(externalDataRecord)) {
      if (!isSignal(value)) {
        throw new DynamicFormError(`externalData["${key}"] must be a Signal. Got: ${typeof value}. Wrap it with signal(yourValue).`);
      }
      resolved[key] = reactive ? (value as Signal<unknown>)() : untracked(() => (value as Signal<unknown>)());
    }

    return resolved;
  }

  /**
   * Creates a REACTIVE evaluation context for logic functions.
   *
   * Unlike createEvaluationContext, this method does NOT use untracked(),
   * which allows logic functions (hidden, readonly, disabled, required) to
   * create reactive dependencies on form values.
   *
   * When a dependent field value changes, the logic function will be re-evaluated.
   *
   * NOTE: This should ONLY be used for logic functions, not validators.
   * Validators should use createEvaluationContext with untracked() to prevent
   * infinite reactive loops. Validators with cross-field dependencies should be
   * hoisted to form-level using validateTree.
   */
  createReactiveEvaluationContext<TValue>(
    fieldContext: FieldContext<TValue>,
    customFunctions?: Record<string, (context: EvaluationContext) => unknown>,
  ): EvaluationContext {
    const fieldValue = fieldContext.value();
    const rootFormValue = this.rootFormRegistry.formValue();
    const pathKeys = safeReadPathKeys(fieldContext);
    const arrayScope = detectArrayScope(pathKeys);

    if (arrayScope) {
      return this.buildArrayScopedContext(rootFormValue, arrayScope, fieldValue, customFunctions, true, fieldContext);
    }

    const localKey = this.extractFieldPath(fieldContext);
    const rootFormSignal = this.rootFormRegistry.rootForm;

    return {
      fieldValue,
      formValue: rootFormValue,
      fieldPath: localKey,
      customFunctions: customFunctions || {},
      externalData: this.resolveExternalData(true),
      logger: this.logger,
      deprecationTracker: this.deprecationTracker ?? undefined,
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
   * This is useful for:
   * - Text fields (display-only, not part of form schema)
   * - Pages (containers that need to evaluate visibility logic)
   *
   * Uses reactive form value access to allow logic re-evaluation when form values change.
   *
   * NOTE: This method does NOT support array-scoped context because display-only
   * components don't have a FieldContext (and therefore no `pathKeys` signal to
   * detect array scope from). If display-only components are placed inside arrays,
   * their logic conditions will evaluate against the root form value.
   *
   * @param fieldPath - The key/path of the display-only component
   * @param customFunctions - Optional custom functions for expression evaluation
   */
  createDisplayOnlyContext(
    fieldPath: string,
    customFunctions?: Record<string, (context: EvaluationContext) => unknown>,
  ): EvaluationContext {
    const formValue = this.rootFormRegistry.formValue();
    const rootFormSignal = this.rootFormRegistry.rootForm;

    return {
      fieldValue: undefined,
      formValue,
      fieldPath,
      customFunctions: customFunctions || {},
      externalData: this.resolveExternalData(true),
      logger: this.logger,
      deprecationTracker: this.deprecationTracker ?? undefined,
      get formFieldState() {
        return createFormFieldStateMap(rootFormSignal() as FieldTree<unknown>, true);
      },
    };
  }
}
