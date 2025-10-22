import { FormCheckboxControl } from '@angular/forms/signals';
import { UnwrapField } from '../utils';

export interface CheckboxField extends UnwrapField<FormCheckboxControl> {
  label: string;
  labelPosition?: 'before' | 'after';
  indeterminate?: boolean;
  color?: 'primary' | 'accent' | 'warn';
  hint?: string;
  className?: string;
}
