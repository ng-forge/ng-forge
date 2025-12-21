import { Injectable, signal, Signal, isSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Registry service that maintains references to root form fields.
 * This provides a type-safe way to access root form values from child fields
 * without relying on internal Angular Forms API navigation.
 *
 * This service should be provided at the component level to ensure proper
 * isolation between different form instances.
 *
 * IMPORTANT: This registry supports two registration patterns:
 * 1. registerFormValueSignal() - Register the SOURCE signal BEFORE form creation
 *    This allows logic functions to read form values during schema evaluation.
 * 2. registerRootForm() - Register the FieldTree AFTER form creation
 *    This provides access to the full form structure.
 *
 * For cross-field logic to work correctly, registerFormValueSignal() should be
 * called BEFORE the form() call.
 */
@Injectable()
export class RootFormRegistryService {
  // Use a signal containing a Map to make registration reactive
  private readonly _rootForms = signal(new Map<string, FieldTree<unknown>>());
  // Store form value signals separately - these can be registered before form creation
  private readonly _formValueSignals = signal(new Map<string, Signal<Record<string, unknown>>>());
  private readonly formContexts = new Map<string, Record<string, unknown>>();

  /**
   * Registers the form value signal BEFORE form creation.
   *
   * This is the recommended pattern for cross-field logic:
   * 1. Create the formValue signal
   * 2. Register it with registerFormValueSignal()
   * 3. Create the form with form(formValue, schema(...))
   *
   * This allows logic functions to access form values during schema evaluation.
   */
  registerFormValueSignal(valueSignal: Signal<Record<string, unknown>>, formId = 'default'): void {
    this._formValueSignals.update((signals) => {
      const newSignals = new Map(signals);
      newSignals.set(formId, valueSignal);
      return newSignals;
    });
  }

  /**
   * Gets the registered form value signal by id.
   *
   * This allows direct access to the source signal, which can be read
   * reactively to get form values.
   */
  getFormValueSignal(formId = 'default'): Signal<Record<string, unknown>> | undefined {
    return this._formValueSignals().get(formId);
  }

  /**
   * Registers a root form field with an optional identifier.
   * If no id is provided, uses 'default' as the key.
   *
   * This triggers reactive updates for any computed signals that
   * depend on getRootForm().
   */
  registerRootForm(rootField: FieldTree<unknown>, formId = 'default'): void {
    this._rootForms.update((forms) => {
      const newForms = new Map(forms);
      newForms.set(formId, rootField);
      return newForms;
    });
  }

  /**
   * Gets a registered root form field by id.
   *
   * IMPORTANT: This method reads from a signal, which means any computed
   * signal that calls this method will automatically re-evaluate when
   * the form is registered or updated.
   */
  getRootForm(formId = 'default'): FieldTree<unknown> | undefined {
    return this._rootForms().get(formId);
  }

  /**
   * Gets the form value, preferring the direct signal if available.
   *
   * This method tries in order:
   * 1. Form value signal (if registered) - reads directly from source signal
   * 2. Root form's .value() (if registered) - reads from FieldTree
   * 3. Returns empty object if nothing is registered
   *
   * Reading from signals creates reactive dependencies, so computeds will
   * re-evaluate when form values change.
   */
  getFormValue(formId = 'default'): Record<string, unknown> {
    // First try the direct value signal (preferred, can be registered before form creation)
    const valueSignal = this._formValueSignals().get(formId);
    if (valueSignal) {
      const value = valueSignal();
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value;
      }
    }

    // Fall back to root form's value
    const rootForm = this._rootForms().get(formId);
    if (rootForm) {
      try {
        let rootValue: unknown;

        // Check if rootForm is a Signal (callable function that returns FieldTree)
        if (isSignal(rootForm)) {
          const fieldTree = rootForm();
          if (fieldTree && typeof fieldTree === 'object' && 'value' in fieldTree) {
            rootValue = (fieldTree as { value: () => unknown }).value();
          }
        } else if ('value' in rootForm && typeof (rootForm as { value: unknown }).value === 'function') {
          rootValue = (rootForm as { value: () => unknown }).value();
        }

        if (rootValue && typeof rootValue === 'object' && !Array.isArray(rootValue)) {
          return rootValue as Record<string, unknown>;
        }
      } catch {
        // Ignore errors when reading form value
      }
    }

    return {};
  }

  /**
   * Registers form context (field paths and metadata) for a specific form.
   * This can be used to store additional context information.
   */
  registerFormContext(context: Record<string, unknown>, formId = 'default'): void {
    this.formContexts.set(formId, context);
  }

  /**
   * Gets form context by id.
   */
  getFormContext(formId = 'default'): Record<string, unknown> {
    return this.formContexts.get(formId) || {};
  }

  /**
   * Unregisters a form and its context.
   * This should be called when a form component is destroyed to prevent memory leaks.
   */
  unregisterForm(formId = 'default'): void {
    this._rootForms.update((forms) => {
      const newForms = new Map(forms);
      newForms.delete(formId);
      return newForms;
    });
    this.formContexts.delete(formId);
  }

  /**
   * Gets all registered form IDs.
   */
  getRegisteredFormIds(): string[] {
    return Array.from(this._rootForms().keys());
  }

  /**
   * Clears all registered forms. Useful for testing.
   */
  clear(): void {
    this._rootForms.set(new Map());
    this._formValueSignals.set(new Map());
    this.formContexts.clear();
  }
}
