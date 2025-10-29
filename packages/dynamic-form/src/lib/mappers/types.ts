import { FieldDef } from '../definitions';
import { Binding, WritableSignal } from '@angular/core';
import { FieldSignalContext } from './utils/field-signal-utils';
import { FieldTypeDefinition } from '../models/field-type';

export interface FieldMapperOptions<TModel = any> {
  fieldSignalContext: FieldSignalContext<TModel>;
  fieldSignals: Map<string, WritableSignal<unknown>>;
  fieldRegistry: Map<string, FieldTypeDefinition>;
}

export type MapperFn<T extends FieldDef<any>> = (input: T, options?: Omit<FieldMapperOptions, 'fieldRegistry'>) => Binding[];
