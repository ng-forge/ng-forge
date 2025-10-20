import { InputSignal } from '@angular/core';

/**
 * Interface for input field components
 * Note: Some properties like 'pattern', 'min', 'max', etc. are omitted here
 * because they conflict with FormValueControl's expectations
 */
export interface InputField {
  label: InputSignal<string>;
  placeholder?: InputSignal<string>;
  type?: InputSignal<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>;
  autocomplete?: InputSignal<string | undefined>;
  hint?: InputSignal<string>;
  tabIndex?: InputSignal<number | undefined>;
  className?: InputSignal<string>;
}
