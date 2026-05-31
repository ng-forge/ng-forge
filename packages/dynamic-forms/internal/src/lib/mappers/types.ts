import { FieldDef } from '../definitions/base/field-def';
import { Injector, Signal, WritableSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Field signal context - the "nervous system" of the dynamic form.
 * Provided via FIELD_SIGNAL_CONTEXT injection token.
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

/** Group context for fields rendered inside `group` containers. */
export interface GroupContext {
  /** Dot-separated path of group ancestors, including the current group's key (e.g. `'address'` or `'user.address'`). */
  groupPath: Signal<string>;
}

/** Mapper function that converts a field definition to component inputs. */
export type MapperFn<T extends FieldDef<unknown>> = (input: T) => Signal<Record<string, unknown>>;
