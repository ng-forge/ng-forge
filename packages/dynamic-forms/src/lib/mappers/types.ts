import { FieldDef } from '../definitions/base/field-def';
import { Injector, Signal, WritableSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Field signal context - the "nervous system" of the dynamic form.
 * Provided via FIELD_SIGNAL_CONTEXT injection token.
 *
 * Gives mappers and components access to form state, values, and configuration.
 * Container fields (Group, Array) create scoped contexts with nested forms.
 *
 * The `form` property uses Angular's FieldTree which includes Subfields<TModel>
 * for type-safe child field access via bracket notation when TModel is a Record.
 *
 * Note: Form-level configuration (defaultValidationMessages, formOptions, defaultProps)
 * is provided via dedicated injection tokens (DEFAULT_VALIDATION_MESSAGES, FORM_OPTIONS,
 * DEFAULT_PROPS) at the DynamicForm level and inherited by all children.
 */
export interface FieldSignalContext<TModel extends Record<string, unknown> = Record<string, unknown>> {
  injector: Injector;
  value: WritableSignal<Partial<TModel> | undefined>;
  defaultValues: () => TModel;
  form: FieldTree<TModel>;
  /** Current page validity signal for paged forms. Used by next button to determine disabled state. */
  currentPageValid?: Signal<boolean>;
}

/**
 * Array context for fields rendered within arrays.
 * Provides position and parent array information for components inside array fields.
 */
export interface ArrayContext {
  /** The key of the parent array field. */
  arrayKey: string;
  /**
   * The index of this item within the array.
   * Uses linkedSignal to automatically update when items are added/removed,
   * allowing index-dependent logic to react without component recreation.
   */
  index: Signal<number>;
  /** The current form value for token resolution. */
  formValue: unknown;
  /** The array field definition. */
  field: FieldDef<unknown>;
}

/**
 * Group context for fields rendered inside `group` containers.
 *
 * Carries the dot-separated chain of group ancestors (including the current
 * group). Used by `mapFieldToInputs` to scope DOM IDs of group children, so
 * the same leaf key can appear inside different groups without producing
 * duplicate `id` attributes (issue #401).
 *
 * Re-provided by every group's child injector — a nested group reads its
 * parent's context and appends its own key.
 */
export interface GroupContext {
  /** Dot-separated path of group ancestors, including the current group's key (e.g. `'address'` or `'user.address'`). */
  groupPath: string;
}

/**
 * Mapper function that converts a field definition to component inputs.
 *
 * Mappers run within an injection context and can inject FIELD_SIGNAL_CONTEXT.
 * Returns a Signal to enable reactive updates when dependencies change.
 */
export type MapperFn<T extends FieldDef<unknown>> = (input: T) => Signal<Record<string, unknown>>;
