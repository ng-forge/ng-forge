import { computed, inject, Signal } from '@angular/core';
import { TextField } from '../../definitions/default/text-field';
import { buildBaseInputs } from '../base/base-field-mapper';
import { DEFAULT_PROPS } from '../../models/field-signal-context.token';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { applyHiddenLogic } from '../apply-hidden-logic';

/**
 * Maps a text field definition to component inputs.
 *
 * Text fields are display-only fields that don't participate in the form schema.
 * This mapper handles the `logic` configuration by using the non-field-hidden resolver
 * to evaluate conditions against the form value from RootFormRegistryService.
 *
 * Hidden state is resolved using the non-field-hidden resolver which considers:
 * 1. Explicit `hidden: true` on the field definition
 * 2. Field-level `logic` array with `type: 'hidden'` conditions
 *
 * Note: Text fields don't support disabled logic since they are display-only.
 *
 * @param fieldDef The text field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function textFieldMapper(fieldDef: TextField): Signal<Record<string, unknown>> {
  const rootFormRegistry = inject(RootFormRegistryService);
  const defaultProps = inject(DEFAULT_PROPS);

  // Return computed signal for reactive updates
  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());
    const inputs: Record<string, unknown> = { ...baseInputs };

    applyHiddenLogic(inputs, fieldDef, rootFormRegistry);

    return inputs;
  });
}
