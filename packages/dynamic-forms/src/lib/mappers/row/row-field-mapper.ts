import { computed, inject, Signal } from '@angular/core';
import { RowField } from '../../definitions/default/row-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { applyHiddenLogic } from '../apply-hidden-logic';

const ROW_WRAPPERS = [{ type: 'row' }] as const;

/** Maps a row field definition to container component inputs. */
export function rowFieldMapper(fieldDef: RowField): Signal<Record<string, unknown>> {
  const rootFormRegistry = inject(RootFormRegistryService);
  const className = buildClassName(fieldDef);

  return computed(() => {
    // Rebuilt each emission so logic-driven updates to fieldDef (e.g. `disabled`)
    // flow through. Shallow spread is safe while RowField has no nested
    // mutable props; add a deep-clone if that stops being true.
    // `type` is rewritten to 'container' because `row` is a synthetic field
    // type — the runtime renders it as a ContainerField with a synthesized
    // `{ type: 'row' }` wrapper.
    const containerField = { ...fieldDef, type: 'container', wrappers: ROW_WRAPPERS };

    const inputs: Record<string, unknown> = {
      key: fieldDef.key,
      field: containerField,
      ...(className !== undefined && { className }),
    };

    applyHiddenLogic(inputs, fieldDef, rootFormRegistry);

    return inputs;
  });
}
