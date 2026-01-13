import { computed, Signal } from '@angular/core';
import { RowField } from '../../definitions/default/row-field';
import { getGridClassString } from '../../utils/grid-classes/grid-classes';

/**
 * Maps a row field definition to component inputs.
 *
 * Row components are layout containers that don't change the form shape.
 * The row component will inject FIELD_SIGNAL_CONTEXT directly.
 *
 * @param fieldDef The row field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function rowFieldMapper(fieldDef: RowField): Signal<Record<string, unknown>> {
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

  // Row inputs are static (no reactive dependencies)
  return computed(() => ({
    key: fieldDef.key,
    field: fieldDef,
    ...(className !== undefined && { className }),
  }));
}
