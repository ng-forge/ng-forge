import { computed, inject, Signal } from '@angular/core';
import { ArrayField } from '../../definitions/default/array-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { applyHiddenLogic } from '../apply-hidden-logic';

/**
 * Maps an array field definition to component inputs.
 *
 * Array components create nested form structures under the array's key.
 * The array component will inject the parent FIELD_SIGNAL_CONTEXT and create
 * a scoped child injector for its array item fields.
 *
 * Supports hidden state resolution via `logic` array or static `hidden` property.
 *
 * @param fieldDef The array field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function arrayFieldMapper(fieldDef: ArrayField): Signal<Record<string, unknown>> {
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
