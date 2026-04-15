import { computed, inject, Signal } from '@angular/core';
import { WrapperField } from '../../definitions/default/wrapper-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { applyHiddenLogic } from '../apply-hidden-logic';

/**
 * Maps a wrapper field definition to component inputs.
 *
 * Wrapper components are layout containers that don't change the form shape.
 * The wrapper component will inject FIELD_SIGNAL_CONTEXT directly.
 *
 * Supports hidden state resolution via `logic` array or static `hidden` property.
 *
 * @param fieldDef The wrapper field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function wrapperFieldMapper(fieldDef: WrapperField): Signal<Record<string, unknown>> {
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
