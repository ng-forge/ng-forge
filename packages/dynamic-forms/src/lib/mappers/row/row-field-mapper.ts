import { computed, inject, Signal } from '@angular/core';
import { RowField } from '../../definitions/default/row-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { applyHiddenLogic } from '../apply-hidden-logic';

const ROW_WRAPPERS = [{ type: 'row' }] as const;

/**
 * Maps a row field definition to container component inputs.
 *
 * `row` is a virtual field type: it resolves to `ContainerFieldComponent` with a
 * synthesized `{ type: 'row' }` wrapper, so the user-facing config stays
 * `{ type: 'row', fields: [...] }` while the runtime uses the container +
 * wrapper pipeline.
 *
 * Supports hidden state resolution via `logic` array or static `hidden` property.
 */
export function rowFieldMapper(fieldDef: RowField): Signal<Record<string, unknown>> {
  const rootFormRegistry = inject(RootFormRegistryService);
  const className = buildClassName(fieldDef);

  return computed(() => {
    // Build the synthetic ContainerField inside the computed so downstream
    // updates to fieldDef (e.g. logic-driven `disabled`) are reflected each
    // emission rather than frozen at mapper-construction time.
    const containerField = { ...fieldDef, wrappers: ROW_WRAPPERS };

    const inputs: Record<string, unknown> = {
      key: fieldDef.key,
      field: containerField,
      ...(className !== undefined && { className }),
    };

    applyHiddenLogic(inputs, fieldDef, rootFormRegistry);

    return inputs;
  });
}
