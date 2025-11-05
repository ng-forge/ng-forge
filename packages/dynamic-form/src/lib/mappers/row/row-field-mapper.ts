import { RowField } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';
import { FieldMapperOptions } from '../types';

/**
 * Maps a row field definition to Angular bindings
 * Row components are layout containers that don't change the form shape - they pass through parent form context
 */
export function rowFieldMapper(fieldDef: RowField, options?: Omit<FieldMapperOptions, 'fieldRegistry'>): Binding[] {
  const bindings: Binding[] = [];

  bindings.push(inputBinding('key', () => fieldDef.key));

  // Row fields need the field definition
  bindings.push(inputBinding('field', () => fieldDef));

  if (options) {
    bindings.push(inputBinding('form', () => options.fieldSignalContext.form));
    bindings.push(inputBinding('fieldSignalContext', () => options.fieldSignalContext));
  }

  return bindings;
}
