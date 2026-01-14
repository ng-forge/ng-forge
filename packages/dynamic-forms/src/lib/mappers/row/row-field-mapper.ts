import { computed, Signal } from '@angular/core';
import { RowField } from '../../definitions/default/row-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';

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
  const className = buildClassName(fieldDef);

  // Row inputs are static (no reactive dependencies)
  return computed(() => ({
    key: fieldDef.key,
    field: fieldDef,
    ...(className !== undefined && { className }),
  }));
}
