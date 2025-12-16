import { inject, Injectable, isSignal, untracked } from '@angular/core';
import { ChildFieldContext, FieldContext } from '@angular/forms/signals';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { RootFormRegistryService } from './root-form-registry.service';
import { DYNAMIC_FORM_LOGGER } from '../../providers/features/logger/logger.token';

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
  private logger = inject(DYNAMIC_FORM_LOGGER);

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

    // Get field path from form context
    const formContext = this.rootFormRegistry.getFormContext(formId);
    const fieldPath = this.extractFieldPath(fieldContext, formContext);

    return {
      fieldValue,
      formValue,
      fieldPath,
      customFunctions: customFunctions || {},
    };
  }

  /**
   * Registers a field path mapping for a specific form.
   * This can be called when fields are created to maintain path information.
   */
  registerFieldPath(fieldKey: string | number, parentPath: string, formId = 'default'): void {
    const context = this.rootFormRegistry.getFormContext(formId);
    const fullPath = parentPath ? `${parentPath}.${fieldKey}` : String(fieldKey);

    context.fieldPaths = context.fieldPaths || {};
    (context.fieldPaths as Record<string, string>)[String(fieldKey)] = fullPath;

    this.rootFormRegistry.registerFormContext(context, formId);
  }

  /**
   * Extracts the field path for a given field context.
   * This is a simplified implementation that could be enhanced
   * based on the specific needs of the form library.
   */
  private extractFieldPath(fieldContext: FieldContext<unknown>, formContext: Record<string, unknown>): string {
    // Check if the field context has a key property (for child fields)
    const extendedContext = fieldContext;

    if (isChildFieldContext(extendedContext)) {
      try {
        const key = extendedContext.key();
        const fieldPaths = (formContext.fieldPaths as Record<string, string>) || {};
        return fieldPaths[String(key)] || String(key);
      } catch (error) {
        this.logger.warn('Unable to extract field key:', error);
      }
    }

    // For root fields or when key is not available
    return '';
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
    // Read field value reactively (creates a dependency)
    const fieldValue = fieldContext.value();

    // Get form value using the new unified method that prefers the direct signal
    // This creates reactive dependencies on the form value signal
    const formValue = this.rootFormRegistry.getFormValue(formId);

    // Get field path from form context
    const formContext = this.rootFormRegistry.getFormContext(formId);
    const fieldPath = this.extractFieldPath(fieldContext, formContext);

    return {
      fieldValue,
      formValue,
      fieldPath,
      customFunctions: customFunctions || {},
    };
  }
}
