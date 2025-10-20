import { InputSignal } from '@angular/core';

/**
 * Option interface for multi-checkbox field
 */
export interface MulticheckboxOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Interface for multi-checkbox field components
 * Allows selection of multiple options through checkboxes
 */
export interface MulticheckboxField<T = unknown> {
  label: InputSignal<string>;
  options: InputSignal<MulticheckboxOption<T>[]>;
  required?: InputSignal<boolean>;
  color?: InputSignal<'primary' | 'accent' | 'warn'>;
  labelPosition?: InputSignal<'before' | 'after'>;
  hint?: InputSignal<string>;
  className?: InputSignal<string>;
}
