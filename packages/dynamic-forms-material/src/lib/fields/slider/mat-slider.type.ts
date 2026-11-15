import { DynamicText } from '@ng-forge/dynamic-forms';
import { SliderField } from '@ng-forge/dynamic-forms/integration';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatSliderProps {
  hint?: DynamicText;
  color?: 'primary' | 'accent' | 'warn';
  /** @deprecated Has no effect: this Material control has no form-field appearance. It will be removed in 2.0. */
  appearance?: MatFormFieldAppearance;
  thumbLabel?: boolean;
  showThumbLabel?: boolean;
  tickInterval?: number | 'auto';
  step?: number;
}

export type MatSliderField = SliderField<MatSliderProps>;
