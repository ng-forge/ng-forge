import { UnwrapField } from '../utils';
import { FormValueControl } from '@angular/forms/signals';

export interface TextareaField extends UnwrapField<FormValueControl<string>> {
  label: string;
  placeholder?: string;
  rows?: number;
  cols?: number | undefined;
  maxlength?: number | undefined;
  hint?: string;
  tabIndex?: number | undefined;
  className?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}
