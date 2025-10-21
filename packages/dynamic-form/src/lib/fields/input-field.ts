export interface InputField {
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  autocomplete?: string | undefined;
  hint?: string;
  tabIndex?: number | undefined;
  className?: string;
}
