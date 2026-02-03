import { computed, inject, Signal } from '@angular/core';
import { DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES } from '@ng-forge/dynamic-forms';
import { SliderField } from '../../definitions';
import { resolveValueFieldContext, buildValueFieldInputs } from '../value/value-field.mapper';

/**
 * Maps a slider field to component inputs.
 *
 * Extends the base value field mapper by adding slider-specific properties:
 * - minValue: Minimum slider value
 * - maxValue: Maximum slider value
 * - step: Step increment for the slider
 *
 * @param fieldDef The slider field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function sliderFieldMapper<TProps>(fieldDef: SliderField<TProps>): Signal<Record<string, unknown>> {
  const ctx = resolveValueFieldContext();
  const defaultProps = inject(DEFAULT_PROPS);
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES);

  return computed(() => {
    const inputs = buildValueFieldInputs(fieldDef, ctx, defaultProps(), defaultValidationMessages());

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
