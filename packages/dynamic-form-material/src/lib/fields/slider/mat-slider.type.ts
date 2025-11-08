import { DynamicText, SliderField, ValueFieldComponent } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatSliderProps {
  hint?: DynamicText;
  color?: 'primary' | 'accent' | 'warn';
  appearance?: MatFormFieldAppearance;
  thumbLabel?: boolean;
  showThumbLabel?: boolean;
  tickInterval?: number | 'auto';
}

export type MatSliderField = SliderField<MatSliderProps>;

export type MatSliderComponent = ValueFieldComponent<MatSliderField>;
