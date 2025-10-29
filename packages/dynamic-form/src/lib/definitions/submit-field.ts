/**
 * Interface for submit button field fields
 */
export interface SubmitField {
  label: string;
  disabled?: boolean;
  className?: string;
  onClick?: (() => void) | undefined;
}
