import { InputSignal } from '@angular/core';

/**
 * Interface for submit button field components
 */
export interface SubmitField {
  label: InputSignal<string>;
  disabled?: InputSignal<boolean>;
  className?: InputSignal<string>;
  onClick?: InputSignal<(() => void) | undefined>;
}
