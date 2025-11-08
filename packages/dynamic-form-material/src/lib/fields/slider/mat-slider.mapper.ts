import { Binding, inputBinding } from '@angular/core';
import { valueFieldMapper, ValueFieldMapperOptions } from '@ng-forge/dynamic-form';
import { MatSliderField } from './mat-slider.type';

export function matSliderFieldMapper(fieldDef: MatSliderField, options: ValueFieldMapperOptions): Binding[] {
  const bindings = valueFieldMapper(fieldDef, options);

  // Add slider-specific bindings that are excluded by baseFieldMapper
  if (fieldDef.minValue !== undefined) {
    bindings.push(inputBinding('minValue', () => fieldDef.minValue));
  }

  if (fieldDef.maxValue !== undefined) {
    bindings.push(inputBinding('maxValue', () => fieldDef.maxValue));
  }

  if (fieldDef.step !== undefined) {
    bindings.push(inputBinding('step', () => fieldDef.step));
  }

  return bindings;
}
