import { BaseValueField } from '../base';

export interface SliderField<TProps extends Record<string, unknown>> extends BaseValueField<TProps, number> {
  minValue: number;
  maxValue: number;
  step: number;
}
