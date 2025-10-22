import { UnwrapField } from '../utils';
import { FormValueControl } from '@angular/forms/signals';

export interface SelectOption<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Interface for select field components
 */
export interface SelectField<T> extends UnwrapField<FormValueControl<T[]>> {
  label: string;
  placeholder?: string;
  options: SelectOption<T>[];
  multiple?: boolean;
  compareWith?: ((o1: T, o2: T) => boolean) | undefined;
  hint?: string;
  className?: string;
}
