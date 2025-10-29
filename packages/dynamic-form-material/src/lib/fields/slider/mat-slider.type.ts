import { SliderField, ValueFieldComponent } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatSliderProps extends Record<string, unknown> {
  hint?: string;
  color: 'primary' | 'accent' | 'warn';
  appearance: MatFormFieldAppearance;
}

export type MatSliderField = SliderField<MatSliderProps>;

export type MatSliderComponent = ValueFieldComponent<MatSliderField>;
