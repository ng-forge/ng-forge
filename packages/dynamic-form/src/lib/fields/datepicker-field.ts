/**
 * Interface for datepicker field components
 */
export interface DatepickerField {
  label: string;
  placeholder?: string;
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  startAt?: Date | null;
  startView?: 'month' | 'year' | 'multi-year';
  touchUi?: boolean;
  disabled?: boolean;
  hint?: string;
  tabIndex?: number | undefined;
  className?: string;
}
