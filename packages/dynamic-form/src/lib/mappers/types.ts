import { FieldDef } from '../definitions';
import { Binding, Injector, WritableSignal } from '@angular/core';
import { FieldTypeDefinition } from '../models/field-type';
import { form } from '@angular/forms/signals';
import { ValidationMessages } from '../models/validation-types';

export interface FieldSignalContext<TModel = any> {
  injector: Injector;
  value: WritableSignal<Partial<TModel> | undefined>;
  defaultValues: () => TModel;
  form: ReturnType<typeof form<TModel>>;
  defaultValidationMessages?: ValidationMessages;
}

/**
 * Array context information for fields rendered within arrays
 */
export interface ArrayContext {
  /** The key of the parent array field */
  arrayKey: string;
  /** The index of this item within the array */
  index: number;
  /** The current form value for token resolution */
  formValue: unknown;
}

export interface FieldMapperOptions<TModel = any> {
  fieldSignalContext: FieldSignalContext<TModel>;
  fieldRegistry: Map<string, FieldTypeDefinition>;
  /** Array context if this field is rendered within an array */
  arrayContext?: ArrayContext;
}

export type MapperFn<T extends FieldDef<any>> = (input: T, options: Omit<FieldMapperOptions, 'fieldRegistry'>) => Binding[];
