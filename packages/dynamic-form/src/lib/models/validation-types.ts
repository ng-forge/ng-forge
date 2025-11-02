import { ValidationError as AngularValidationError } from '@angular/forms/signals';

/**
 * Re-export Angular's ValidationError for consistency
 * This replaces our custom ValidationError interface
 */
export type ValidationError = AngularValidationError;

/**
 * Custom validator function following Angular signal forms pattern
 */
export type CustomValidator<TValue = unknown> = (value: TValue, formValue: unknown) => ValidationError | null;

/**
 * Custom error messages for validation rules
 */
export interface ValidationMessages {
  required?: string;
  email?: string;
  min?: string;
  max?: string;
  minLength?: string;
  maxLength?: string;
  pattern?: string;
  [key: string]: string | undefined;
}
