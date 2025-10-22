import { UnwrapField } from '../utils';
import { FormCheckboxControl } from '@angular/forms/signals';

export interface ToggleField extends UnwrapField<FormCheckboxControl> {
  label: string;
  labelPosition?: 'before' | 'after';
  color?: 'primary' | 'accent' | 'warn';
  hint?: string;
  className?: string;
}
