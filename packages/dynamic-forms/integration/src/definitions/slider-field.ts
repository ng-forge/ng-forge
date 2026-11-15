import { BaseValueField, FieldMeta } from '@ng-forge/dynamic-forms/internal';

/**
 * A number, or a range from kits that have one: PrimeNG `range` gives `number[]`, Ionic
 * `dualKnobs` gives `{ lower, upper }`. The inferred form value follows the props.
 */
export type SliderValue = number | readonly number[] | { lower: number; upper: number };

export interface SliderField<TProps, TNullable extends boolean = boolean> extends BaseValueField<
  TProps,
  SliderValue,
  FieldMeta,
  TNullable
> {
  type: 'slider';
  minValue?: number;
  maxValue?: number;
  step?: number;
}
