import { FieldDef } from '../definitions';
import { Binding, Injector, WritableSignal } from '@angular/core';
import { FieldTypeDefinition } from '../models/field-type';
import { form } from '@angular/forms/signals';

export interface FieldSignalContext<TModel = any> {
  injector: Injector;
  value: WritableSignal<Partial<TModel> | undefined>;
  defaultValues: () => TModel;
  form: ReturnType<typeof form<TModel>>;
}

export interface FieldMapperOptions<TModel = any> {
  fieldSignalContext: FieldSignalContext<TModel>;
  fieldRegistry: Map<string, FieldTypeDefinition>;
}

export type MapperFn<T extends FieldDef<any>> = (input: T, options: Omit<FieldMapperOptions, 'fieldRegistry'>) => Binding[];
