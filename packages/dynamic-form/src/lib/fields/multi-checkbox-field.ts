export interface MultiCheckboxOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface MultiCheckboxField<T> {
  label: string;
  options: MultiCheckboxOption<T>[];
  color?: 'primary' | 'accent' | 'warn';
  labelPosition?: 'before' | 'after';
  hint?: string;
  className?: string;
}
