import { computed, inject, Signal } from '@angular/core';
import { RowField } from '../../definitions/default/row-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { applyHiddenLogic } from '../apply-hidden-logic';

/**
 * Maps a row field definition to component inputs.
 *
 * Row components are layout containers that don't change the form shape.
 * The row component will inject FIELD_SIGNAL_CONTEXT directly.
 *
 * Supports hidden state resolution via `logic` array or static `hidden` property.
 *
 * @param fieldDef The row field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function rowFieldMapper(fieldDef: RowField): Signal<Record<string, unknown>> {
  const rootFormRegistry = inject(RootFormRegistryService);
  const className = buildClassName(fieldDef);

  return computed(() => {
    const inputs: Record<string, unknown> = {
      key: fieldDef.key,
      field: fieldDef,
      ...(className !== undefined && { className }),
    };

    applyHiddenLogic(inputs, fieldDef, rootFormRegistry);

    return inputs;
  });
}
