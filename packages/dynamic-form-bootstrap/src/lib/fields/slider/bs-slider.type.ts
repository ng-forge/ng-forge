import { DynamicText, SliderField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsSliderProps extends Record<string, unknown> {
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  helpText?: DynamicText;
}

export type BsSliderField = SliderField<BsSliderProps>;

export type BsSliderComponent = ValueFieldComponent<BsSliderField>;
