import { ConditionalExpression } from '../expressions/conditional-expression';

/**
 * Base configuration shared by all validators
 */
export interface BaseValidatorConfig {
  /** Custom error message */
  errorMessage?: string;

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
 * Custom validator configuration
 * Supports both simple validators (value, formValue) and context-aware validators (FieldContext)
 */
export interface CustomValidatorConfig extends BaseValidatorConfig {
  /** Validator type identifier */
  type: 'custom';

  /** Name of registered validator function */
  functionName: string;

  /** Optional parameters to pass to validator function */
  params?: Record<string, unknown>;
}

/**
 * Tree validator configuration for cross-field validation
 */
export interface TreeValidatorConfig extends BaseValidatorConfig {
  /** Validator type identifier */
  type: 'customTree';

  /** Name of registered tree validator function */
  functionName: string;

  /** Optional parameters to pass to validator function */
  params?: Record<string, unknown>;

  /** Fields that should receive errors from this validator (for documentation) */
  targetFields?: string[];
}

/**
 * Configuration for signal forms validator functions that can be serialized from API
 * Discriminated union type for type-safe validator configuration
 */
export type ValidatorConfig = BuiltInValidatorConfig | CustomValidatorConfig | TreeValidatorConfig;
