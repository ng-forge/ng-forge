import { ValidationError as AngularValidationError } from '@angular/forms/signals';
import { DynamicText } from '../pipes';

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
 * Custom error messages for validation rules.
 * Supports static strings, Observables, and Signals for dynamic content.
 */
export interface ValidationMessages {
  required?: DynamicText;
  email?: DynamicText;
  min?: DynamicText;
  max?: DynamicText;
  minLength?: DynamicText;
  maxLength?: DynamicText;
  pattern?: DynamicText;
  [key: string]: DynamicText | undefined;
}
