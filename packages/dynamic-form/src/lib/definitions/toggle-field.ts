import { UnwrapField } from '../utils';
import { FormCheckboxControl } from '@angular/forms/signals';

export interface ToggleField extends UnwrapField<FormCheckboxControl> {
  label: string;
  hint?: string;
  className?: string;
}
