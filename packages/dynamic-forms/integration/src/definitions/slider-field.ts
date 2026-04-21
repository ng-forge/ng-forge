import { BaseValueField, FieldMeta } from '@ng-forge/dynamic-forms';

export interface SliderField<TProps, TNullable extends boolean = boolean> extends BaseValueField<TProps, number, FieldMeta, TNullable> {
  type: 'slider';
  minValue?: number;
  maxValue?: number;
  step?: number;
}
