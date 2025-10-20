/**
 * Option interface for radio field
 */
export interface RadioOption<T > {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Interface for radio field components
 */
export interface RadioField<T> {
  label: string;
  options: RadioOption<T>[];
  required?: boolean;
  color?: 'primary' | 'accent' | 'warn';
  labelPosition?: 'before' | 'after';
  hint?: string;
  className?: string;
}
