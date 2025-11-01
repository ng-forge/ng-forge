import { BaseCheckedField } from '../../definitions';
import { Binding } from '@angular/core';
import { baseFieldMapper } from '../base/base-field-mapper';
import { FieldMapperOptions } from '../types';
import { omit } from 'lodash-es';

export type CheckboxFieldMapperOptions<TModel = any> = Omit<FieldMapperOptions<TModel>, 'fieldRegistry'>;

export function checkboxFieldMapper(fieldDef: BaseCheckedField<any>, options: CheckboxFieldMapperOptions): Binding[] {
  const omittedFields = omit(fieldDef, ['checked', 'defaultValue']);

  return baseFieldMapper(omittedFields, options);
}
