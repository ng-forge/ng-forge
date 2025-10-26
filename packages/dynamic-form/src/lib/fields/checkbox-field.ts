import { FormCheckboxControl } from '@angular/forms/signals';
import { UnwrapField } from '../utils';

export interface CheckboxField extends UnwrapField<FormCheckboxControl> {
  label: string;
  hint?: string;
  className?: string;
}
