import { UnwrapField } from '../utils';
import { FormValueControl } from '@angular/forms/signals';

export interface SliderField extends UnwrapField<FormValueControl<string>> {
  label: string;
  minValue: number;
  maxValue: number;
  step: number;
  thumbLabel: boolean;
  showThumbLabel?: boolean;
  tickInterval?: number | 'auto' | undefined;
  vertical?: boolean;
  invert?: boolean;
  color?: 'primary' | 'accent' | 'warn';
  hint?: string;
  className?: string;
}
