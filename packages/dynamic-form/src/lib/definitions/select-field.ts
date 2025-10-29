import { UnwrapField } from '../models';
import { FormValueControl } from '@angular/forms/signals';

export interface SelectOption<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Interface for select field fields
 */
export interface SelectField<T> extends UnwrapField<FormValueControl<T[]>> {
  label: string;
  placeholder?: string;
  options: SelectOption<T>[];
  hint?: string;
  className?: string;
}
