import { InjectionToken, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Minimal interface describing the signals that RootFormRegistryService
 * needs from the host DynamicForm component.
 *
 * Using an injection token instead of injecting DynamicForm directly
 * avoids a circular module dependency:
 *   DynamicForm → RootFormRegistryService → DynamicForm
 */
export interface DynamicFormRef {
  readonly entity: Signal<Record<string, unknown>>;
  readonly form: Signal<FieldTree<Record<string, unknown>> | undefined>;
}

/**
 * Injection token provided by DynamicForm so that RootFormRegistryService
 * can read form state without importing the component class.
 */
export const DYNAMIC_FORM_REF = new InjectionToken<DynamicFormRef>('DYNAMIC_FORM_REF');
