import { UnwrapField } from '../utils';
import { FormValueControl } from '@angular/forms/signals';

export interface MultiCheckboxOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface MultiCheckboxField<T> extends UnwrapField<FormValueControl<T[]>> {
  label: string;
  options: MultiCheckboxOption<T>[];
  hint?: string;
  className?: string;
}
