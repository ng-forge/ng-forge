import { InputSignal } from '@angular/core';

/**
 * Interface for datepicker field components
 */
export interface DatepickerField {
  label: InputSignal<string>;
  placeholder?: InputSignal<string>;
  minDate?: InputSignal<Date | string | null>;
  maxDate?: InputSignal<Date | string | null>;
  startAt?: InputSignal<Date | null>;
  startView?: InputSignal<'month' | 'year' | 'multi-year'>;
  touchUi?: InputSignal<boolean>;
  disabled?: InputSignal<boolean>;
  hint?: InputSignal<string>;
  tabIndex?: InputSignal<number | undefined>;
  className?: InputSignal<string>;
}