import { computed, Signal } from '@angular/core';
import { PageField } from '../../definitions/default/page-field';
import { getGridClassString } from '../../utils/grid-classes/grid-classes';

/**
 * Maps a page field definition to component inputs.
 *
 * Page fields are layout containers that don't modify the form context.
 * The page component will inject FIELD_SIGNAL_CONTEXT directly.
 *
 * @param fieldDef The page field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function pageFieldMapper(fieldDef: PageField): Signal<Record<string, unknown>> {
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

  // Page inputs are static (no reactive dependencies)
  return computed(() => ({
    key: fieldDef.key,
    field: fieldDef,
    ...(className !== undefined && { className }),
  }));
}
