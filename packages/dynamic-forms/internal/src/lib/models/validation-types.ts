import { ValidationError as AngularValidationError } from '@angular/forms/signals';
import { DynamicText } from './types/dynamic-text';

/**
 * Re-export Angular's ValidationError for consistency
 * This replaces our custom ValidationError interface
 */
export type ValidationError = AngularValidationError;

/**
 * Resolves a validation message from the validation error, so error params
 * (e.g. maxLength, min) can be passed to an i18n layer natively.
 */
export type ValidationMessageResolver = (error: ValidationError) => DynamicText;

/** A validation message: static or reactive text, or a function of the validation error. */
export type ValidationMessage = DynamicText | ValidationMessageResolver;

export interface ValidationMessages {
  required?: ValidationMessage;
  email?: ValidationMessage;
  min?: ValidationMessage;
  max?: ValidationMessage;
  minLength?: ValidationMessage;
  maxLength?: ValidationMessage;
  pattern?: ValidationMessage;
  [key: string]: ValidationMessage | undefined;
}
