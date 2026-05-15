import type { AsyncCustomValidator, CustomValidator, HttpCustomValidator } from '../../core/validation/validator-types';
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
 * Custom validator configuration using Angular's public FieldContext API.
 * Returns ValidationError | ValidationError[] | null synchronously.
 *
 * Three authoring forms (mutually exclusive at runtime, not enforced by TypeScript):
 * 1. Registered function: `{ type: 'custom', functionName: 'myValidator' }`
 * 2. Inline function (code-only): `{ type: 'custom', fn: (ctx) => ... }`
 * 3. Expression-based: `{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }`
 *
 * Unlike `AsyncValidatorConfig` and `FunctionHttpValidatorConfig` (strict `fn` ↔
 * `functionName` XOR via discriminated unions), this surface keeps a permissive
 * interface — the historical expression-vs-functionName split was already
 * runtime-checked, so adding `fn` follows the same precedent. The runtime
 * resolver picks one source and warns if `fn` and `functionName` are both set;
 * inline `fn` wins.
 *
 * `fn` is NOT JSON-serializable — for code-only configs. For configs loaded from
 * JSON / OpenAPI / databases, prefer `functionName` to reference a function
 * registered in `customFnConfig.validators`.
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
 *
 * Two mutually exclusive authoring forms:
 * - `functionName`: name of a function registered in `customFnConfig.asyncValidators`.
 *   JSON-serializable; suitable for configs loaded from APIs, databases, or OpenAPI.
 * - `fn`: inline async validator. NOT JSON-serializable; for code-only configs.
 *
 * Exactly one of `functionName` or `fn` must be set.
 */
export type AsyncValidatorConfig =
  | (AsyncValidatorConfigShared & {
      /** Name of registered async validator function */
      functionName: string;
      /** Inline form is forbidden when `functionName` is set */
      fn?: never;
    })
  | (AsyncValidatorConfigShared & {
      /**
       * Inline async validator. Mutually exclusive with `functionName`.
       *
       * NOT JSON-serializable — for code-only configs. For configs loaded
       * from JSON / OpenAPI / databases, use `functionName` to reference
       * a validator registered in `customFnConfig.asyncValidators`.
       */
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

/**
 * Function-based HTTP validator configuration. Uses Angular's `validateHttp` API.
 *
 * Two mutually exclusive authoring forms:
 * - `functionName`: name of an HTTP validator registered in `customFnConfig.httpValidators`.
 *   JSON-serializable.
 * - `fn`: inline HTTP validator. NOT JSON-serializable; for code-only configs.
 *
 * Exactly one of `functionName` or `fn` must be set.
 *
 * Discriminated from `DeclarativeHttpValidatorConfig` by the presence of `functionName`
 * or `fn` (and absence of `http` + `responseMapping`).
 */
export type FunctionHttpValidatorConfig =
  | (FunctionHttpValidatorConfigShared & {
      /** Name of registered HTTP validator configuration */
      functionName: string;
      /** Inline form is forbidden when `functionName` is set */
      fn?: never;
    })
  | (FunctionHttpValidatorConfigShared & {
      /**
       * Inline HTTP validator. Mutually exclusive with `functionName`.
       *
       * NOT JSON-serializable — for code-only configs. For configs loaded
       * from JSON / OpenAPI / databases, use `functionName` to reference
       * an HTTP validator registered in `customFnConfig.httpValidators`.
       */
      fn: HttpCustomValidator;
      /** Registered form is forbidden when `fn` is set */
      functionName?: never;
    });

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
 * Use `isFunctionHttpValidator()` for type-safe narrowing when `type` alone is insufficient.
 */
export type ValidatorConfig =
  | BuiltInValidatorConfig
  | CustomValidatorConfig
  | AsyncValidatorConfig
  | FunctionHttpValidatorConfig
  | DeclarativeHttpValidatorConfig;

/**
 * Type guard to distinguish function-based HTTP validators from declarative ones.
 *
 * Both use `type: 'http'`, so `switch (config.type)` cannot narrow between them.
 * Use this guard when you need type-safe access to `FunctionHttpValidatorConfig` properties.
 */
export function isFunctionHttpValidator(
  config: FunctionHttpValidatorConfig | DeclarativeHttpValidatorConfig,
): config is FunctionHttpValidatorConfig {
  return ('functionName' in config && !!config.functionName) || ('fn' in config && typeof (config as { fn?: unknown }).fn === 'function');
}
