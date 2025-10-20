/**
 * Interface for checkbox field components
 */
export interface CheckboxField {
  label: string;
  required?: boolean;
  labelPosition?: 'before' | 'after';
  indeterminate?: boolean;
  color?: 'primary' | 'accent' | 'warn';
  hint?: string;
  className?: string;
}
