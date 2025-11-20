import { RowField } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';

/**
 * Maps a row field definition to Angular bindings
 * Row components are layout containers that don't change the form shape.
 * The row component will inject FIELD_SIGNAL_CONTEXT directly.
 */
export function rowFieldMapper(fieldDef: RowField): Binding[] {
  const bindings: Binding[] = [];

  bindings.push(inputBinding('key', () => fieldDef.key));

  // Row fields need the field definition
  bindings.push(inputBinding('field', () => fieldDef));

  return bindings;
}
