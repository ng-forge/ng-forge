import { InputSignal } from '@angular/core';

/**
 * Option for select field
 */
export interface SelectOption {
  label: string;
  value: unknown;
  disabled?: boolean;
}

/**
 * Interface for select field components
 */
export interface SelectField {
  label: InputSignal<string>;
  placeholder?: InputSignal<string>;
  options: InputSignal<SelectOption[]>;
  multiple?: InputSignal<boolean>;
  required?: InputSignal<boolean>;
  compareWith?: InputSignal<((o1: unknown, o2: unknown) => boolean) | undefined>;
  hint?: InputSignal<string>;
  className?: InputSignal<string>;
}