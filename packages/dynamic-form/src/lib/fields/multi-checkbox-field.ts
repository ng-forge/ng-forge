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
export interface MultiCheckboxField<T = unknown> {
  label: string;
  options: MulticheckboxOption<T>[];
  required?: boolean;
  color?: 'primary' | 'accent' | 'warn';
  labelPosition?: 'before' | 'after';
  hint?: string;
  className?: string;
}
