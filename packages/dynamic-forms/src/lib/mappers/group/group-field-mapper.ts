import { computed, Signal } from '@angular/core';
import { GroupField } from '../../definitions/default/group-field';
import { getGridClassString } from '../../utils/grid-classes/grid-classes';

/**
 * Maps a group field definition to component inputs.
 *
 * Group components create nested form structures under the group's key.
 * The group component will inject the parent FIELD_SIGNAL_CONTEXT and create
 * a scoped child injector for its nested fields.
 *
 * @param fieldDef The group field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function groupFieldMapper(fieldDef: GroupField): Signal<Record<string, unknown>> {
  // Combine user className with generated grid classes
  const gridClassString = getGridClassString(fieldDef);
  const allClasses: string[] = [];

  if (gridClassString) {
    allClasses.push(gridClassString);
  }

  if (fieldDef.className) {
    allClasses.push(fieldDef.className);
  }

  const className = allClasses.length > 0 ? allClasses.join(' ') : undefined;

  // Group inputs are static (no reactive dependencies)
  return computed(() => ({
    key: fieldDef.key,
    field: fieldDef,
    ...(className !== undefined && { className }),
  }));
}
