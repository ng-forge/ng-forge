import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { SliderField } from '@ng-forge/dynamic-forms/integration';
import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface MatSliderProps {
  hint?: DynamicText;
  color?: 'primary' | 'accent' | 'warn';
  appearance?: MatFormFieldAppearance;
  thumbLabel?: boolean;
  showThumbLabel?: boolean;
  tickInterval?: number | 'auto';
  step?: number;
}

export type MatSliderField = SliderField<MatSliderProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type MatSliderComponent = ValueFieldComponent<MatSliderField>;
