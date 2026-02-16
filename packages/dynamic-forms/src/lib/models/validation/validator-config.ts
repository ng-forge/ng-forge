import { ConditionalExpression } from '../expressions/conditional-expression';
import { HttpRequestConfig } from '../http/http-request-config';
import { HttpValidationResponseMapping } from '../http/http-response-mapping';

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
 * Async custom validator configuration using Angular's validateAsync API.
 * Returns Observable<ValidationError | ValidationError[] | null>.
 *
 * Accepts both `'async'` (preferred) and `'customAsync'` (deprecated) type literals.
 */
export interface AsyncValidatorConfig extends BaseValidatorConfig {
  /**
   * Validator type identifier.
   *
   * Use `'async'` for new code. `'customAsync'` is accepted for backward compatibility
   * but emits a deprecation warning in dev mode.
   */
  type: 'async' | 'customAsync';

  /** Name of registered async validator function */
  functionName: string;

  /** Optional parameters to pass to validator function */
  params?: Record<string, unknown>;
}

/**
 * Function-based HTTP validator configuration — requires a registered function.
 *
 * Uses Angular's `validateHttp` API. The function is registered via
 * `customFnConfig.httpValidators`.
 *
 * Discriminated from `DeclarativeHttpValidatorConfig` by the presence of `functionName`.
 *
 * Accepts both `'http'` (preferred) and `'customHttp'` (deprecated) type literals.
 *
 * @deprecated Prefer `DeclarativeHttpValidatorConfig` (`type: 'http'` with `http` + `responseMapping`)
 * for fully JSON-serializable validation. Use this form only when function registration is required.
 */
export interface FunctionHttpValidatorConfig extends BaseValidatorConfig {
  /**
   * Validator type identifier.
   *
   * Use `'http'` for new code. `'customHttp'` is accepted for backward compatibility
   * but emits a deprecation warning in dev mode.
   */
  type: 'http' | 'customHttp';

  /** Name of registered HTTP validator configuration */
  functionName: string;

  /** Optional parameters to pass to HTTP validator */
  params?: Record<string, unknown>;
}

/**
 * @deprecated Use `FunctionHttpValidatorConfig` instead. Will be removed in a future minor version.
 */
export type HttpValidatorConfig = FunctionHttpValidatorConfig;

/**
 * Declarative HTTP validator configuration — fully JSON-serializable, no function registration required.
 *
 * Uses `HttpRequestConfig` to define the HTTP request and `HttpValidationResponseMapping`
 * to interpret the response as a validation result. Powered by Angular's `validateHttp` API.
 *
 * Discriminated from `FunctionHttpValidatorConfig` by the presence of `http` + `responseMapping`
 * (and absence of `functionName`).
 */
export interface DeclarativeHttpValidatorConfig extends BaseValidatorConfig {
  /** Validator type identifier */
  type: 'http';

  /** HTTP request configuration with expression-based query params and body */
  http: HttpRequestConfig;

  /** Mapping that interprets the HTTP response as a validation result */
  responseMapping: HttpValidationResponseMapping;
}

/**
 * Configuration for signal forms validator functions that can be serialized from API.
 * Discriminated union type for type-safe validator configuration.
 *
 * Note: `FunctionHttpValidatorConfig` and `DeclarativeHttpValidatorConfig` both use `type: 'http'`.
 * They are discriminated by property presence: `functionName` → function-based, `http` → declarative.
 */
export type ValidatorConfig =
  | BuiltInValidatorConfig
  | CustomValidatorConfig
  | AsyncValidatorConfig
  | FunctionHttpValidatorConfig
  | DeclarativeHttpValidatorConfig;
