import { computed, inject, Signal } from '@angular/core';
import { FormEvent } from '@ng-forge/dynamic-forms';
import { buildBaseInputs, DEFAULT_PROPS } from '@ng-forge/dynamic-forms/internal';
import { ButtonField } from '../../definitions';
import { injectNonFieldLogicResolver } from './non-field-logic.utils';

/**
 * Maps a button field to component inputs.
 *
 * @param fieldDef The button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function buttonFieldMapper<TProps, TEvent extends FormEvent>(
  fieldDef: ButtonField<TProps, TEvent>,
): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const resolveLogic = injectNonFieldLogicResolver(fieldDef);

  return computed(() => {
    const inputs = buildBaseInputs(fieldDef, defaultProps());
    inputs['event'] = fieldDef.event;

    if (fieldDef.eventArgs !== undefined) {
      inputs['eventArgs'] = fieldDef.eventArgs;
    }

    return {
      ...inputs,
      ...resolveLogic(),
    };
  });
}
