import { UnwrapField } from '../models';
import { FormValueControl } from '@angular/forms/signals';

export interface RadioOption<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface RadioField<T> extends UnwrapField<FormValueControl<T[]>> {
  label: string;
  options: RadioOption<T>[];
  hint?: string;
  className?: string;
}
