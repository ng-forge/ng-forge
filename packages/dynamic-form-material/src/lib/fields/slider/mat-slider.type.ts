import { DynamicText, SliderField, ValueFieldComponent } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatSliderProps extends Record<string, unknown> {
  hint?: DynamicText;
  color?: 'primary' | 'accent' | 'warn';
  appearance?: MatFormFieldAppearance;
}

export type MatSliderField = SliderField<MatSliderProps>;

// Exclude minValue, maxValue, step from component interface since they're handled by Field directive metadata
export type MatSliderComponent = Omit<ValueFieldComponent<MatSliderField>, 'minValue' | 'maxValue' | 'step'>;
