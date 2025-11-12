import { ArrayField } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';
import { FieldMapperOptions } from '../types';

/**
 * Maps an array field definition to Angular bindings
 * Array components create nested form structures under the array's key
 */
export function arrayFieldMapper(fieldDef: ArrayField, options?: Omit<FieldMapperOptions, 'fieldRegistry'>): Binding[] {
  const bindings: Binding[] = [];

  bindings.push(inputBinding('key', () => fieldDef.key));

  // Array fields need the field definition
  bindings.push(inputBinding('field', () => fieldDef));

  // Pass parent form context for creating nested form structure
  if (options) {
    bindings.push(inputBinding('parentForm', () => options.fieldSignalContext.form));
    bindings.push(inputBinding('parentFieldSignalContext', () => options.fieldSignalContext));
  }

  return bindings;
}
