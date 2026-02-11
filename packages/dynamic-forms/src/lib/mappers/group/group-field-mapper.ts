import { computed, inject, Signal } from '@angular/core';
import { GroupField } from '../../definitions/default/group-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { applyHiddenLogic } from '../apply-hidden-logic';

/**
 * Maps a group field definition to component inputs.
 *
 * Group components create nested form structures under the group's key.
 * The group component will inject the parent FIELD_SIGNAL_CONTEXT and create
 * a scoped child injector for its nested fields.
 *
 * Supports hidden state resolution via `logic` array or static `hidden` property.
 *
 * @param fieldDef The group field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function groupFieldMapper(fieldDef: GroupField): Signal<Record<string, unknown>> {
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
