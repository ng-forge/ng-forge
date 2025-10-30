import { RowField } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';
import { FieldMapperOptions } from '../types';

/**
 * Maps a row field definition to Angular bindings
 * Row field components handle child field mapping internally using the same pattern as dynamic-form.component.ts
 * Note: Row components are layout containers, so they don't need UI bindings like label, disabled, etc.
 */
export function rowFieldMapper(fieldDef: RowField<any>, options?: Omit<FieldMapperOptions, 'fieldRegistry'>): Binding[] {
  const bindings: Binding[] = [];

  // Row fields need the field definition
  bindings.push(inputBinding('field', () => fieldDef));

  // Add value binding for two-way binding with fieldSignals
  if (options?.fieldSignals) {
    const fieldSignal = options.fieldSignals.get(fieldDef.key);
    if (fieldSignal) {
      bindings.push(inputBinding('value', fieldSignal));
    }
  }

  return bindings;
}
