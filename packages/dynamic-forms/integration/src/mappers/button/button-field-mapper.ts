import { computed, inject, Signal } from '@angular/core';
import { buildBaseInputs, DEFAULT_PROPS, FormEvent, RootFormRegistryService } from '@ng-forge/dynamic-forms';
import { ButtonField } from '../../definitions';
import { applyNonFieldLogic } from './non-field-logic.utils';

/**
 * Maps a button field to component inputs.
 *
 * Unlike value field mappers, button fields do not participate in form values
 * and do not need field tree resolution or validation messages.
 *
 * Button-specific properties:
 * - event: The FormEvent constructor to emit when clicked
 * - eventArgs: Optional arguments to pass to the event constructor
 *
 * Hidden and disabled states are resolved using non-field logic resolvers which consider:
 * 1. Explicit `hidden: true` / `disabled: true` on the field definition
 * 2. Field-level `logic` array with `type: 'hidden'` or `type: 'disabled'` conditions
 *
 * @param fieldDef The button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function buttonFieldMapper<TProps, TEvent extends FormEvent>(
  fieldDef: ButtonField<TProps, TEvent>,
): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const rootFormRegistry = inject(RootFormRegistryService);

  return computed(() => {
    const inputs = buildBaseInputs(fieldDef, defaultProps());

    // Add button-specific properties
    inputs['event'] = fieldDef.event;

    if (fieldDef.eventArgs !== undefined) {
      inputs['eventArgs'] = fieldDef.eventArgs;
    }

    // Apply hidden/disabled logic
    return {
      ...inputs,
      ...applyNonFieldLogic(rootFormRegistry, fieldDef),
    };
  });
}
