import { DynamicText, SliderField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsSliderProps extends Record<string, unknown> {
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  helpText?: DynamicText;
}

export type BsSliderField = SliderField<BsSliderProps>;

// Exclude minValue, maxValue, step from component interface since they're handled by Field directive metadata
export type BsSliderComponent = Omit<ValueFieldComponent<BsSliderField>, 'minValue' | 'maxValue' | 'step'>;
