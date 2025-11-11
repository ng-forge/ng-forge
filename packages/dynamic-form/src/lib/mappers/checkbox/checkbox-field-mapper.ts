import { BaseCheckedField, FieldDef } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';
import { baseFieldMapper } from '../base/base-field-mapper';
import { FieldMapperOptions } from '../types';
import { omit } from 'lodash-es';

export type CheckboxFieldMapperOptions<TModel = any> = Omit<FieldMapperOptions<TModel>, 'fieldRegistry'>;

export function checkboxFieldMapper(fieldDef: BaseCheckedField<any>, options: CheckboxFieldMapperOptions): Binding[] {
  const omittedFields = omit(fieldDef, ['checked', 'defaultValue']) as FieldDef<any>;

  const bindings: Binding[] = baseFieldMapper(omittedFields);

  // Always pass validationMessages (or empty object) - required for error display signals
  bindings.push(inputBinding('validationMessages', () => fieldDef.validationMessages ?? {}));

  // Pass default validation messages for fallback error translations
  const defaultValidationMessages = options.fieldSignalContext.defaultValidationMessages;
  if (defaultValidationMessages !== undefined) {
    bindings.push(inputBinding('defaultValidationMessages', () => defaultValidationMessages));
  }

  const formRoot = options.fieldSignalContext.form();
  const childrenMap = (formRoot as any).structure?.childrenMap?.();

  const formField = childrenMap?.get(fieldDef.key);
  if (formField?.fieldProxy) {
    bindings.push(inputBinding('field', () => formField.fieldProxy));
  }

  return bindings;
}
