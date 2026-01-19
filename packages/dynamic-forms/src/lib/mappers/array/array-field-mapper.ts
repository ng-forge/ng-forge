import { computed, Signal } from '@angular/core';
import { ArrayField } from '../../definitions/default/array-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';

/**
 * Maps an array field definition to component inputs.
 *
 * Array components create nested form structures under the array's key.
 * The array component will inject the parent FIELD_SIGNAL_CONTEXT and create
 * a scoped child injector for its array item fields.
 *
 * @param fieldDef The array field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function arrayFieldMapper(fieldDef: ArrayField): Signal<Record<string, unknown>> {
  const className = buildClassName(fieldDef);

  // Array inputs are static (no reactive dependencies)
  return computed(() => ({
    key: fieldDef.key,
    field: fieldDef,
    ...(className !== undefined && { className }),
  }));
}
