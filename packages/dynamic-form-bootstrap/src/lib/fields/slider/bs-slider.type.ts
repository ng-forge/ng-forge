import { DynamicText, SliderField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsSliderProps {
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  helpText?: DynamicText;
  min?: number;
  max?: number;
  step?: number;
}

export type BsSliderField = SliderField<BsSliderProps>;

export type BsSliderComponent = ValueFieldComponent<BsSliderField>;
