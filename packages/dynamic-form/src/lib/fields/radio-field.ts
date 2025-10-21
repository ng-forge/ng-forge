export interface RadioOption<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface RadioField<T> {
  label: string;
  options: RadioOption<T>[];
  color?: 'primary' | 'accent' | 'warn';
  labelPosition?: 'before' | 'after';
  hint?: string;
  className?: string;
}
