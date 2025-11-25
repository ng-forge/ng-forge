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
export interface FieldSignalContext<TModel = unknown> {
  injector: Injector;
  value: WritableSignal<Partial<TModel> | undefined>;
  defaultValues: () => TModel;
  form: ReturnType<typeof form<TModel>>;
  defaultValidationMessages?: ValidationMessages;
}

/**
 * Array context information for fields rendered within arrays.
 *
 * This metadata is passed as an input binding to components rendered inside array fields,
 * providing context about their position and parent array.
 */
export interface ArrayContext {
  /** The key of the parent array field */
  arrayKey: string;
  /** The index of this item within the array */
  index: number;
  /** The current form value for token resolution */
  formValue: unknown;
  /** The array field definition */
  field: FieldDef<unknown>;
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
export type MapperFn<T extends FieldDef<unknown>> = (input: T) => Binding[];
