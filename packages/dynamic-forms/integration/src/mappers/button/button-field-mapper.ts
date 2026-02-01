import { computed, inject, Signal } from '@angular/core';
import { buildBaseInputs, DEFAULT_PROPS, FormEvent } from '@ng-forge/dynamic-forms';
import { ButtonField } from '../../definitions';

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
 * @param fieldDef The button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function buttonFieldMapper<TProps, TEvent extends FormEvent>(
  fieldDef: ButtonField<TProps, TEvent>,
): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);

  return computed(() => {
    const inputs = buildBaseInputs(fieldDef, defaultProps());

    // Add button-specific properties
    inputs['event'] = fieldDef.event;

    if (fieldDef.eventArgs !== undefined) {
      inputs['eventArgs'] = fieldDef.eventArgs;
    }

    return inputs;
  });
}
