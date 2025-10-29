import { UnwrapField } from '../models';
import { FormValueControl } from '@angular/forms/signals';

export interface SliderField extends UnwrapField<FormValueControl<string>> {
  label: string;
  minValue: number;
  maxValue: number;
  step: number;
  hint?: string;
  className?: string;
}
