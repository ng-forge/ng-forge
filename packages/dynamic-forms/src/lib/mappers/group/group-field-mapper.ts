import { GroupField } from '../../definitions/default/group-field';
import { Binding, inputBinding } from '@angular/core';

/**
 * Maps a group field definition to Angular bindings
 * Group components create nested form structures under the group's key.
 * The group component will inject the parent FIELD_SIGNAL_CONTEXT and create
 * a scoped child injector for its nested fields.
 */
export function groupFieldMapper(fieldDef: GroupField): Binding[] {
  const bindings: Binding[] = [];

  bindings.push(inputBinding('key', () => fieldDef.key));

  // Group fields need the field definition
  bindings.push(inputBinding('field', () => fieldDef));

  return bindings;
}
