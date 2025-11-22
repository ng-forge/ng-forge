import { ConditionalExpression } from '../expressions/conditional-expression';

/**
 * Base configuration shared by all validators
 */
export interface BaseValidatorConfig {
  /** Conditional logic for when validator applies */
  when?: ConditionalExpression;
}

/**
 * Built-in validator configuration (required, email, min, max, etc.)
 */
export interface BuiltInValidatorConfig extends BaseValidatorConfig {
  /** Validator type identifier */
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern';

  /** Static value for the validator (e.g., min value, pattern) */
  value?: number | string | RegExp;

  /** Dynamic value expression that evaluates to validator parameter */
  expression?: string;
}

/**
 * Custom validator configuration using Angular's public FieldContext API
 * Returns ValidationError | ValidationError[] | null synchronously
 *
 * Supports two patterns:
 * 1. Function-based: { type: 'custom', functionName: 'myValidator' }
 * 2. Expression-based: { type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }
 */
export interface CustomValidatorConfig extends BaseValidatorConfig {
  /** Validator type identifier */
  type: 'custom';

  /** Name of registered validator function (function-based pattern) */
  functionName?: string;

  /** Optional parameters to pass to validator function */
  params?: Record<string, unknown>;

  /** JavaScript expression to evaluate (expression-based pattern) */
  expression?: string;

  /** Error kind for expression-based validators - links to validationMessages */
  kind?: string;

  /**
   * Parameters to include in error object for message interpolation (expression-based pattern)
   * Map of parameter names to expressions that will be evaluated in the same context as the validation expression
   *
   * @example
   * errorParams: {
   *   minValue: 'formValue.minValue',
   *   maxValue: 'formValue.maxValue'
   * }
   * // Allows message template: "Value must be between {{minValue}} and {{maxValue}}"
   */
  errorParams?: Record<string, string>;
}

/**
 * Async custom validator configuration using Angular's validateAsync API
 * Returns Observable<ValidationError | ValidationError[] | null>
 */
export interface AsyncValidatorConfig extends BaseValidatorConfig {
  /** Validator type identifier */
  type: 'customAsync';

  /** Name of registered async validator function */
  functionName: string;

  /** Optional parameters to pass to validator function */
  params?: Record<string, unknown>;
}

/**
 * HTTP validator configuration using Angular's validateHttp API
 * Provides optimized HTTP validation with automatic request cancellation
 */
export interface HttpValidatorConfig extends BaseValidatorConfig {
  /** Validator type identifier */
  type: 'customHttp';

  /** Name of registered HTTP validator configuration */
  functionName: string;

  /** Optional parameters to pass to HTTP validator */
  params?: Record<string, unknown>;
}

/**
 * Configuration for signal forms validator functions that can be serialized from API
 * Discriminated union type for type-safe validator configuration
 */
export type ValidatorConfig = BuiltInValidatorConfig | CustomValidatorConfig | AsyncValidatorConfig | HttpValidatorConfig;
