import { RowField } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';
import { baseFieldMapper } from '../base/base-field-mapper';
import { FieldMapperOptions } from '../types';

/**
 * Maps a row field definition to Angular bindings
 * Row field components handle child field mapping internally using the same pattern as dynamic-form.component.ts
 */
export function rowFieldMapper(fieldDef: RowField<any>, options?: Omit<FieldMapperOptions, 'fieldRegistry'>): Binding[] {
  const bindings = baseFieldMapper(fieldDef);

  // Add the formValue binding if we have a field signal context
  if (options?.fieldSignalContext) {
    bindings.push(inputBinding('formValue', () => options.fieldSignalContext.value()));
  }

  return bindings;
}
