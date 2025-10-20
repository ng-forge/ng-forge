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
  label: string;
  placeholder?: string;
  options: SelectOption<T>[];
  multiple?: boolean;
  required?: boolean;
  compareWith?: ((o1: T, o2: T) => boolean) | undefined;
  hint?: string;
  className?: string;
}
