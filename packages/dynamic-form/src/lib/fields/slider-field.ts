/**
 * Interface for slider/range field components
 */
export interface SliderField {
  label: string;
  minValue: number;
  maxValue: number;
  step: number;
  thumbLabel: boolean;
  tickInterval: number | 'auto' | undefined;
  vertical: boolean;
  invert: boolean;
  hint: string;
  className: string;
}
