import { BaseValueField } from '@ng-forge/dynamic-forms';

export interface SliderField<TProps> extends BaseValueField<TProps, number> {
  type: 'slider';
  minValue?: number;
  maxValue?: number;
  step?: number;
}
