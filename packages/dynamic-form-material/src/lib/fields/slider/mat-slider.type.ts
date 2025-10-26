import { SliderField } from '@ng-forge/dynamic-form';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatSliderProps extends SliderField {
  color: 'primary' | 'accent' | 'warn';
  appearance: MatFormFieldAppearance;
}

// export type MatSliderField = FieldType<MatSliderProps>;
