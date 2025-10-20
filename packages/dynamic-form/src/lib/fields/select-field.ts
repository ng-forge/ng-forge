import { InputSignal } from '@angular/core';

/**
 * Option for select field
 */
export interface SelectOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Interface for select field components
 */
export interface SelectField<T = unknown> {
  label: InputSignal<string>;
  placeholder?: InputSignal<string>;
  options: InputSignal<SelectOption<T>[]>;
  multiple?: InputSignal<boolean>;
  required?: InputSignal<boolean>;
  compareWith?: InputSignal<((o1: unknown, o2: unknown) => boolean) | undefined>;
  hint?: InputSignal<string>;
  className?: InputSignal<string>;
}
