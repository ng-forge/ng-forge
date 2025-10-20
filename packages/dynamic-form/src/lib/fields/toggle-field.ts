import { InputSignal } from '@angular/core';

/**
 * Interface for toggle/slide-toggle field components
 */
export interface ToggleField {
  label: InputSignal<string>;
  labelPosition?: InputSignal<'before' | 'after'>;
  required?: InputSignal<boolean>;
  disabled?: InputSignal<boolean>;
  color?: InputSignal<'primary' | 'accent' | 'warn'>;
  hint?: InputSignal<string>;
  className?: InputSignal<string>;
}