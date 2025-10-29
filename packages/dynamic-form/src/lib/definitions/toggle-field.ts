import { UnwrapField } from '../models';
import { FormCheckboxControl } from '@angular/forms/signals';

export interface ToggleField extends UnwrapField<FormCheckboxControl> {
  label: string;
  hint?: string;
  className?: string;
}
