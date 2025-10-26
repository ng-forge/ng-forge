import { UnwrapField } from '../utils';
import { FormValueControl } from '@angular/forms/signals';

export interface DatepickerField extends UnwrapField<FormValueControl<Date | null>> {
  label: string;
  placeholder?: string;
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  startAt?: Date | null;
  hint?: string;
  tabIndex?: number | undefined;
  className?: string;
}
