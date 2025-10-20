import { InputSignal } from '@angular/core';

/**
 * Option interface for radio field
 */
export interface RadioOption {
  label: string;
  value: any;
  disabled?: boolean;
}

/**
 * Interface for radio field components
 */
export interface RadioField {
  label: InputSignal<string>;
  options: InputSignal<RadioOption[]>;
  required?: InputSignal<boolean>;
  color?: InputSignal<'primary' | 'accent' | 'warn'>;
  labelPosition?: InputSignal<'before' | 'after'>;
  hint?: InputSignal<string>;
  className?: InputSignal<string>;
}
