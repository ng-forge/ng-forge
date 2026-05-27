import type { AsyncCustomValidator, CustomValidator, HttpCustomValidator } from '../../core/validation/validator-types';
import { ConditionalExpression } from '../expressions/conditional-expression';
import { HttpRequestConfig } from '../http/http-request-config';
import { HttpValidationResponseMapping } from '../http/http-response-mapping';

/** Base configuration shared by all validators */
export interface BaseValidatorConfig {
  /** Conditional logic for when validator applies */
  when?: ConditionalExpression;
}

/** Built-in validator configuration (required, email, min, max, etc.) */
export interface BuiltInValidatorConfig extends BaseValidatorConfig {
  /** Validator type identifier */
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern';

  /** Static value for the validator (e.g., min value, pattern) */
  value?: number | string | RegExp;

  /** Dynamic value expression that evaluates to validator parameter */
  expression?: string;
}

/**
 * Custom validator configuration using Angular's public FieldContext API.
 * Returns ValidationError | ValidationError[] | null synchronously.
 */
export interface CustomValidatorConfig extends BaseValidatorConfig {
  /** Validator type identifier */
  type: 'custom';

  /** Name of registered validator function (function-based pattern) */
  functionName?: string;

  /**
   * Inline custom validator (code-only authoring).
   * Mutually exclusive with `functionName`. NOT JSON-serializable.
   */
  fn?: CustomValidator;

  /** Optional parameters to pass to validator function */
  params?: Record<string, unknown>;

  /** JavaScript expression to evaluate (expression-based pattern) */
  expression?: string;

  /** Error kind for expression-based validators - links to validationMessages */
  kind?: string;

  /**
   * Parameters to include in error object for message interpolation (expression-based pattern)
   * Map of parameter names to expressions that will be evaluated in the same context as the validation expression
   */
  errorParams?: Record<string, string>;
}

/**
 * Shared fields for both branches of {@link AsyncValidatorConfig}.
 *
 * @internal
 */
interface AsyncValidatorConfigShared extends BaseValidatorConfig {
  /** Validator type identifier. */
  type: 'async';
  /** Optional parameters to pass to validator function */
  params?: Record<string, unknown>;
}

/**
 * Async custom validator configuration using Angular's `validateAsync` API.
 * Returns Observable<ValidationError | ValidationError[] | null>.
 */
export type AsyncValidatorConfig =
  | (AsyncValidatorConfigShared & {
      /** Name of registered async validator function */
      functionName: string;
      /** Inline form is forbidden when `functionName` is set */
      fn?: never;
    })
  | (AsyncValidatorConfigShared & {
      /** Inline async validator. Mutually exclusive with `functionName`. */
      fn: AsyncCustomValidator;
      /** Registered form is forbidden when `fn` is set */
      functionName?: never;
    });

/**
 * Shared fields for both branches of {@link FunctionHttpValidatorConfig}.
 *
 * @internal
 */
interface FunctionHttpValidatorConfigShared extends BaseValidatorConfig {
  /** Validator type identifier. */
  type: 'http';
  /** Optional parameters to pass to HTTP validator */
  params?: Record<string, unknown>;
}

/** Function-based HTTP validator configuration. Uses Angular's `validateHttp` API. */
export type FunctionHttpValidatorConfig =
  | (FunctionHttpValidatorConfigShared & {
      /** Name of registered HTTP validator configuration */
      functionName: string;
      /** Inline form is forbidden when `functionName` is set */
      fn?: never;
    })
  | (FunctionHttpValidatorConfigShared & {
      /** Inline HTTP validator. Mutually exclusive with `functionName`. */
      fn: HttpCustomValidator;
      /** Registered form is forbidden when `fn` is set */
      functionName?: never;
    });

/** Declarative HTTP validator configuration — fully JSON-serializable, no function registration required. */
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
 */
export type ValidatorConfig =
  | BuiltInValidatorConfig
  | CustomValidatorConfig
  | AsyncValidatorConfig
  | FunctionHttpValidatorConfig
  | DeclarativeHttpValidatorConfig;

/** Type guard to distinguish function-based HTTP validators from declarative ones. */
export function isFunctionHttpValidator(
  config: FunctionHttpValidatorConfig | DeclarativeHttpValidatorConfig,
): config is FunctionHttpValidatorConfig {
  const c = config as { functionName?: unknown; fn?: unknown };
  return typeof c.functionName === 'string' || (c.fn !== null && typeof c.fn === 'object');
}
