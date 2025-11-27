import { BaseValueField } from '../base/base-value-field';

export interface SliderField<TProps> extends BaseValueField<TProps, number> {
  type: 'slider';
  minValue?: number;
  maxValue?: number;
  step?: number;
}
