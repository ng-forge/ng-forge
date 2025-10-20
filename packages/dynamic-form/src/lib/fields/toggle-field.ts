/**
 * Interface for toggle/slide-toggle field components
 */
export interface ToggleField {
  label: string;
  labelPosition?: 'before' | 'after';
  required?: boolean;
  disabled?: boolean;
  color?: 'primary' | 'accent' | 'warn';
  hint?: string;
  className?: string;
}
