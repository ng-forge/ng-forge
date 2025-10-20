import { InputSignal } from '@angular/core';

/**
 * Interface for textarea field components
 */
export interface TextareaField {
  label: InputSignal<string>;
  placeholder?: InputSignal<string>;
  rows?: InputSignal<number>;
  cols?: InputSignal<number | undefined>;
  maxlength?: InputSignal<number | undefined>;
  hint?: InputSignal<string>;
  tabIndex?: InputSignal<number | undefined>;
  className?: InputSignal<string>;
  resize?: InputSignal<'none' | 'both' | 'horizontal' | 'vertical'>;
}