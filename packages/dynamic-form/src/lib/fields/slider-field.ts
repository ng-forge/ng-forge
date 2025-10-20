import { InputSignal } from '@angular/core';

/**
 * Interface for slider/range field components
 */
export interface SliderField {
  label: InputSignal<string>;
  minValue?: InputSignal<number>;
  maxValue?: InputSignal<number>;
  step?: InputSignal<number>;
  value?: InputSignal<number>;
  thumbLabel?: InputSignal<boolean>;
  tickInterval?: InputSignal<number | 'auto' | undefined>;
  vertical?: InputSignal<boolean>;
  invert?: InputSignal<boolean>;
  disabled?: InputSignal<boolean>;
  color?: InputSignal<'primary' | 'accent' | 'warn'>;
  hint?: InputSignal<string>;
  className?: InputSignal<string>;
}