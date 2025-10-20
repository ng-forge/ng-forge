/**
 * Interface for input field components
 * Note: Some properties like 'pattern', 'min', 'max', etc. are omitted here
 * because they conflict with FormValueControl's expectations
 */
export interface InputField {
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  autocomplete?: string | undefined;
  hint?: string;
  tabIndex?: number | undefined;
  className?: string;
}
