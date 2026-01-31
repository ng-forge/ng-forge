import { inject, Injectable, isSignal, Signal, untracked } from '@angular/core';
import { ChildFieldContext, FieldContext } from '@angular/forms/signals';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { EXTERNAL_DATA } from '../../models/field-signal-context.token';
import { RootFormRegistryService } from './root-form-registry.service';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';

function isChildFieldContext<TValue>(context: FieldContext<TValue>): context is ChildFieldContext<TValue> {
  return 'key' in context && isSignal(context.key);
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
    formId = 'default',
  ): EvaluationContext {
    // Use untracked() to read the field value WITHOUT creating a reactive dependency.
    // This prevents infinite loops when logic functions are evaluated inside computed signals.
    const fieldValue = untracked(() => fieldContext.value());

    // Get form value using the unified method, wrapped in untracked() to prevent
    // reactive dependencies. This allows validators and dynamic values to access
    // form values without causing infinite loops.
    //
    // Without untracked():
    // 1. Validator runs and reads formValue via this context
    // 2. This creates a signal dependency on the form's value
    // 3. Any field change updates the form value signal
    // 4. All validators that read formValue re-run
    // 5. They read formValue again, creating new dependencies
    // 6. Infinite loop until browser freezes
    //
    // With untracked():
    // - Form value is read as a snapshot, no dependency is created
    // - Validators still run when their own field value changes (via fieldValue)
    // - Cross-field validation still works, just without cascading re-evaluation
    const formValue = untracked(() => this.rootFormRegistry.getFormValue(formId));
    const fieldPath = this.extractFieldPath(fieldContext);

    return {
      fieldValue,
      formValue,
      fieldPath,
      customFunctions: customFunctions || {},
      externalData: this.resolveExternalData(false),
      logger: this.logger,
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
   * Resolves external data signals to their current values.
   *
   * @param reactive - If true, reads signals reactively (creates dependencies).
   *                   If false, reads signals with untracked() (no dependencies).
   * @returns Record of resolved external data values, or undefined if no external data.
   */
  private resolveExternalData(reactive: boolean): Record<string, unknown> | undefined {
    const externalDataRecord = reactive ? this.externalDataSignal?.() : untracked(() => this.externalDataSignal?.());

    if (!externalDataRecord) {
      return undefined;
    }

    const resolved: Record<string, unknown> = {};
    for (const [key, signal] of Object.entries(externalDataRecord)) {
      resolved[key] = reactive ? (signal as Signal<unknown>)() : untracked(() => (signal as Signal<unknown>)());
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
   * IMPORTANT: For this to work correctly, the form value signal should be
   * registered with rootFormRegistry.registerFormValueSignal() BEFORE the
   * form is created. This ensures the logic function can read form values
   * during schema evaluation.
   *
   * NOTE: This should ONLY be used for logic functions, not validators.
   * Validators should use createEvaluationContext with untracked() to prevent
   * infinite reactive loops. Validators with cross-field dependencies should be
   * hoisted to form-level using validateTree.
   */
  createReactiveEvaluationContext<TValue>(
    fieldContext: FieldContext<TValue>,
    customFunctions?: Record<string, (context: EvaluationContext) => unknown>,
    formId = 'default',
  ): EvaluationContext {
    const fieldValue = fieldContext.value();
    const formValue = this.rootFormRegistry.getFormValue(formId);
    const fieldPath = this.extractFieldPath(fieldContext);

    return {
      fieldValue,
      formValue,
      fieldPath,
      customFunctions: customFunctions || {},
      externalData: this.resolveExternalData(true),
      logger: this.logger,
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
   * @param fieldPath - The key/path of the display-only component
   * @param customFunctions - Optional custom functions for expression evaluation
   * @param formId - Optional form identifier (defaults to 'default')
   */
  createDisplayOnlyContext(
    fieldPath: string,
    customFunctions?: Record<string, (context: EvaluationContext) => unknown>,
    formId = 'default',
  ): EvaluationContext {
    const formValue = this.rootFormRegistry.getFormValue(formId);

    return {
      fieldValue: undefined,
      formValue,
      fieldPath,
      customFunctions: customFunctions || {},
      externalData: this.resolveExternalData(true),
      logger: this.logger,
    };
  }
}
