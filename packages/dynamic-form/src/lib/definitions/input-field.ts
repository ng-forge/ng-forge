import { UnwrapField } from '../utils';
import { FormValueControl } from '@angular/forms/signals';

export interface InputField extends UnwrapField<FormValueControl<string>> {
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  autocomplete?: string | undefined;
  hint?: string;
  tabIndex?: number | undefined;
  className?: string;
}
