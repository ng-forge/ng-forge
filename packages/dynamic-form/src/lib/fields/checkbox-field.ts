export interface CheckboxField {
  label: string;
  labelPosition?: 'before' | 'after';
  indeterminate?: boolean;
  color?: 'primary' | 'accent' | 'warn';
  hint?: string;
  className?: string;
}
