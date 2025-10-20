/**
 * Interface for textarea field components
 */
export interface TextareaField {
  label: string;
  placeholder?: string;
  rows?: number;
  cols?: number | undefined;
  maxlength?: number | undefined;
  hint?: string;
  tabIndex?: number | undefined;
  className?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}
