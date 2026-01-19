import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { SliderField } from '@ng-forge/dynamic-forms/integration';

export interface BsSliderProps {
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  hint?: DynamicText;
  min?: number;
  max?: number;
  step?: number;
}

export type BsSliderField = SliderField<BsSliderProps>;

export type BsSliderComponent = ValueFieldComponent<BsSliderField>;
