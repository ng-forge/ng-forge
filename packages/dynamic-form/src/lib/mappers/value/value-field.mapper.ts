import { BaseValueField } from '../../definitions';
import { Binding } from '@angular/core';
import { baseFieldMapper } from '../base/base-field-mapper';
import { FieldMapperOptions } from '../types';
import { omit } from 'lodash-es';

export type ValueFieldMapperOptions<TModel = any> = Omit<FieldMapperOptions<TModel>, 'fieldRegistry'>;

export function valueFieldMapper(fieldDef: BaseValueField<any, any>, options: ValueFieldMapperOptions): Binding[] {
  const omittedFields = omit(fieldDef, ['value', 'defaultValue']);

  return baseFieldMapper(omittedFields, options);
}
