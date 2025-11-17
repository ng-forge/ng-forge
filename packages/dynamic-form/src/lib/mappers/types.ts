import { FieldDef } from '../definitions';
import { Binding, Injector, WritableSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { ValidationMessages } from '../models/validation-types';

/**
 * Field signal context contains the "nervous system" of the dynamic form.
 *
 * This context is provided via the FIELD_SIGNAL_CONTEXT injection token and
 * gives mappers and components access to:
 * - The form instance and structure
 * - Current form values (as signals)
 * - Default values
 * - Validation messages
 * - The injector for creating components
 *
 * Container fields (Group, Array) create scoped contexts with nested forms.
 */
export interface FieldSignalContext<TModel = any> {
  injector: Injector;
  value: WritableSignal<Partial<TModel> | undefined>;
  defaultValues: () => TModel;
  form: ReturnType<typeof form<TModel>>;
  defaultValidationMessages?: ValidationMessages;
}

/**
 * Mapper function type that converts a field definition to component bindings.
 *
 * Mappers run within an injection context and inject FIELD_SIGNAL_CONTEXT to
 * access the form's state and configuration.
 *
 * @example
 * ```typescript
 * export function myCustomMapper(fieldDef: MyFieldDef): Binding[] {
 *   const context = inject(FIELD_SIGNAL_CONTEXT);
 *   const form = context.form();
 *   // ... create bindings
 *   return bindings;
 * }
 * ```
 */
export type MapperFn<T extends FieldDef<any>> = (input: T) => Binding[];
