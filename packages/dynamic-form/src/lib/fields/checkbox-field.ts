import { InputSignal } from '@angular/core';

/**
 * Interface for checkbox field components
 */
export interface CheckboxField {
  label: InputSignal<string>;
  required?: InputSignal<boolean>;
  labelPosition?: InputSignal<'before' | 'after'>;
  indeterminate?: InputSignal<boolean>;
  color?: InputSignal<'primary' | 'accent' | 'warn'>;
  hint?: InputSignal<string>;
  className?: InputSignal<string>;
}