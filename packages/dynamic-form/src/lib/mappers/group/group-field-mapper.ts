import { GroupField } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';
import { FieldMapperOptions } from '../types';

/**
 * Maps a group field definition to Angular bindings
 * Group components create nested form structures under the group's key
 */
export function groupFieldMapper(fieldDef: GroupField<any>, options?: Omit<FieldMapperOptions, 'fieldRegistry'>): Binding[] {
  const bindings: Binding[] = [];

  // Group fields need the field definition
  bindings.push(inputBinding('field', () => fieldDef));

  // Pass parent form context for creating nested form structure
  if (options) {
    bindings.push(inputBinding('parentForm', () => options.fieldSignalContext.form));
    bindings.push(inputBinding('parentFieldSignalContext', () => options.fieldSignalContext));
  }

  return bindings;
}
