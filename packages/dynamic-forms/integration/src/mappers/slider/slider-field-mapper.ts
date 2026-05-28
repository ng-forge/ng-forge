import { computed, inject, Signal } from '@angular/core';
import { DEFAULT_PROPS } from '@ng-forge/dynamic-forms';
import { SliderField } from '../../definitions';
import { resolveValueFieldContext, buildValueFieldInputs } from '../value/value-field.mapper';

/**
 * Maps a slider field to component inputs.
 *
 * @param fieldDef The slider field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function sliderFieldMapper<TProps>(fieldDef: SliderField<TProps>): Signal<Record<string, unknown>> {
  const ctx = resolveValueFieldContext();
  const defaultProps = inject(DEFAULT_PROPS);

  return computed(() => {
    const inputs = buildValueFieldInputs(fieldDef, ctx, defaultProps());

    // Add slider-specific properties (these are at field level, not in props)
    if (fieldDef.minValue !== undefined) {
      inputs['minValue'] = fieldDef.minValue;
    }
    if (fieldDef.maxValue !== undefined) {
      inputs['maxValue'] = fieldDef.maxValue;
    }
    if (fieldDef.step !== undefined) {
      inputs['step'] = fieldDef.step;
    }

    return inputs;
  });
}
