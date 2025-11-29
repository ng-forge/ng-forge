import { ArrayField } from '../../definitions/default/array-field';
import { Binding, inputBinding } from '@angular/core';

/**
 * Maps an array field definition to Angular bindings
 * Array components create nested form structures under the array's key.
 * The array component will inject the parent FIELD_SIGNAL_CONTEXT and create
 * a scoped child injector for its array item fields.
 */
export function arrayFieldMapper(fieldDef: ArrayField): Binding[] {
  const bindings: Binding[] = [];

  bindings.push(inputBinding('key', () => fieldDef.key));

  // Array fields need the field definition
  bindings.push(inputBinding('field', () => fieldDef));

  return bindings;
}
