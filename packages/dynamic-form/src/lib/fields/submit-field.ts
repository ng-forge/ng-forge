/**
 * Interface for submit button field components
 */
export interface SubmitField {
  label: string;
  disabled?: boolean;
  className?: string;
  onClick?: (() => void) | undefined;
}
