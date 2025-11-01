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
 * Validation rules for dynamic form fields
 */
export interface ValidationRules<TValue = unknown> {
  /** Field is required */
  required?: boolean;

  /** Email validation */
  email?: boolean;

  /** Minimum value for numbers */
  min?: number;

  /** Maximum value for numbers */
  max?: number;

  /** Minimum length for strings */
  minLength?: number;

  /** Maximum length for strings */
  maxLength?: number;

  /** Pattern validation */
  pattern?: string | RegExp;

  /** Custom validation functions */
  custom?: CustomValidator<TValue>[];
}

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

/**
 * Conditional field behavior rules
 */
export interface ConditionalRules {
  /** Show field when condition is true */
  show?: (formValue: unknown) => boolean;

  /** Hide field when condition is true */
  hide?: (formValue: unknown) => boolean;

  /** Enable field when condition is true */
  enable?: (formValue: unknown) => boolean;

  /** Disable field when condition is true */
  disable?: (formValue: unknown) => boolean;
}