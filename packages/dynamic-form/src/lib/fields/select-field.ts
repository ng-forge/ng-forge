export interface SelectOption<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Interface for select field components
 */
export interface SelectField<T> {
  label: string;
  placeholder?: string;
  options: SelectOption<T>[];
  multiple?: boolean;
  compareWith?: ((o1: T, o2: T) => boolean) | undefined;
  hint?: string;
  className?: string;
}
