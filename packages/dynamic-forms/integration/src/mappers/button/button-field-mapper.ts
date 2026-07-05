import { computed, inject, Signal } from '@angular/core';
import { FormEvent } from '@ng-forge/dynamic-forms';
import { buildBaseInputs, DEFAULT_PROPS, RootFormRegistryService } from '@ng-forge/dynamic-forms/internal';
import { ButtonField } from '../../definitions';
import { applyNonFieldLogic, injectNonFieldEvaluationContext } from './non-field-logic.utils';

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
  const rootFormRegistry = inject(RootFormRegistryService);
  const evaluationContext = injectNonFieldEvaluationContext(fieldDef);

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
      ...applyNonFieldLogic(rootFormRegistry, fieldDef, evaluationContext),
    };
  });
}
