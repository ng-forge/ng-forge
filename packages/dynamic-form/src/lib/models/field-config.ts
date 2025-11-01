/**
 * Validation rules
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
 * Custom error messages
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
 * Custom validator function following signal forms pattern
 */
export type CustomValidator<TValue = unknown> = (value: TValue, formValue: unknown) => ValidationError | null;

/**
 * Validation error structure
 */
export interface ValidationError {
  readonly type: string;
  readonly message: string;
  readonly params?: Record<string, unknown>;
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

/**
 * Utility function to build validation rules from field properties
 */
// export function buildValidationRules<T>(field: FieldDef): ValidationRules<T> {
//   // If explicit validation is provided, use it
//   if (field.validation) {
//     return field.validation as ValidationRules<T>;
//   }
//
//   // Otherwise, build from implicit properties
//   const rules: ValidationRules<T> = {};
//
//   if (field.required) rules.required = true;
//   if (field.email) rules.email = true;
//   if (field.min !== undefined) rules.min = field.min;
//   if (field.max !== undefined) rules.max = field.max;
//   if (field.minLength !== undefined) rules.minLength = field.minLength;
//   if (field.maxLength !== undefined) rules.maxLength = field.maxLength;
//   if (field.patternRule) {
//     rules.pattern = typeof field.patternRule === 'string' ? new RegExp(field.patternRule) : field.patternRule;
//   }
//
//   return rules;
// }
