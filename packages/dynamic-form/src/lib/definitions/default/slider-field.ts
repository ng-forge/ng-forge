import { BaseValueField } from '../base';

export interface SliderField<TProps> extends BaseValueField<TProps, number> {
  minValue?: number;
  maxValue?: number;
  step?: number;
}
