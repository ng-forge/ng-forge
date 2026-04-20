import { BaseValueField, FieldMeta } from '@ng-forge/dynamic-forms';

export interface SliderField<TProps, TNullable extends boolean = false> extends BaseValueField<TProps, number, FieldMeta, TNullable> {
  type: 'slider';
  minValue?: number;
  maxValue?: number;
  step?: number;
}
