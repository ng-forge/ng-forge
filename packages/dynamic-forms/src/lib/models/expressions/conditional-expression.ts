import type { CustomFunction } from '../../core/expressions/custom-function-types';
import type { AsyncConditionFunction } from '../../core/expressions/async-custom-function-types';
import type { HttpRequestConfig } from '../http/http-request-config';

/**
 * Comparison operators for field value and form value conditions.
 *
 * @public
 */
export type ComparisonOperator =
  | 'equals'
  | 'notEquals'
  | 'greater'
  | 'less'
  | 'greaterOrEqual'
  | 'lessOrEqual'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'matches';

/**
 * Condition that compares a specific field's value against an expected value.
 *
 * @public
 */
export interface FieldValueCondition {
  type: 'fieldValue';
  /** Path to the field whose value to compare */
  fieldPath: string;
  /** Comparison operator */
  operator: ComparisonOperator;
  /** Value to compare against */
  value?: unknown;
}

/**
 * Condition that invokes a custom function.
 *
 * Two mutually exclusive forms:
 * - `functionName`: name of a function registered in `customFnConfig.customFunctions`.
 *   JSON-serializable; suitable for configs loaded from APIs, databases, or OpenAPI.
 * - `fn`: inline function. NOT JSON-serializable; for code-only configs.
 *
 * Exactly one of `functionName` or `fn` must be set.
 *
 * Encoded as a strict discriminated union (XOR via `?: never`). `CustomValidatorConfig`
 * intentionally uses a permissive interface for the same `fn`/`functionName` split
 * because validators have a third source (`expression`) and the historical interface
 * was already runtime-checked — the asymmetry is by design, not an oversight.
 *
 * @public
 */
export type CustomCondition =
  | {
      type: 'custom';
      /** Name of the registered custom function to invoke */
      functionName: string;
      /** Inline form is forbidden when `functionName` is set */
      fn?: never;
    }
  | {
      type: 'custom';
      /**
       * Inline custom function. Mutually exclusive with `functionName`.
       *
       * NOT JSON-serializable — for code-only configs. For configs loaded
       * from JSON / OpenAPI / databases, use `functionName` to reference
       * a function registered in `customFnConfig.customFunctions`.
       */
      fn: CustomFunction;
      /** Registered form is forbidden when `fn` is set */
      functionName?: never;
    };

/**
 * Condition that evaluates a JavaScript expression using the secure AST-based parser.
 *
 * The expression has access to `formValue`, `fieldValue`, `externalData`, etc.
 *
 * @public
 */
export interface JavascriptCondition {
  type: 'javascript';
  /** JavaScript expression string to evaluate */
  expression: string;
}

/**
 * Condition that evaluates based on an HTTP response from a remote server.
 *
 * The HTTP request is resolved reactively — when dependent form values change,
 * the request is re-evaluated (with debouncing). The result is cached per
 * resolved request to avoid redundant network calls.
 *
 * Since `LogicFn` must return `boolean` synchronously, this condition uses
 * a signal-based async resolution pattern internally.
 *
 * @public
 */
export interface HttpCondition {
  type: 'http';
  /** HTTP request configuration */
  http: HttpRequestConfig;
  /**
   * Expression to extract boolean from response (scope: `{ response }`).
   * e.g. `'response.allowed'`, `'response.permissions.canEdit'`
   * When omitted, the entire response is coerced to boolean: `!!response`
   */
  responseExpression?: string;
  /**
   * Value to return while the HTTP request is in-flight.
   *
   * Choose based on the logic type and desired UX:
   * - For `hidden`: `false` = visible while loading, `true` = hidden while loading
   * - For `disabled`: `false` = enabled while loading, `true` = disabled while loading
   * - For `required`: `false` = optional while loading, `true` = required while loading
   *
   * @default false
   */
  pendingValue?: boolean;
  /** Cache duration in ms for HTTP responses. @default 30000 */
  cacheDurationMs?: number;
  /**
   * Debounce time in milliseconds for re-evaluation when dependent form values change.
   * @default 300
   */
  debounceMs?: number;
}

/**
 * Shared fields for both branches of {@link AsyncCondition}.
 *
 * @internal
 */
interface AsyncConditionBase {
  type: 'async';
  /**
   * Value to return while async resolution is pending.
   *
   * Choose based on the logic type and desired UX:
   * - For `hidden`: `false` = visible while loading, `true` = hidden while loading
   * - For `disabled`: `false` = enabled while loading, `true` = disabled while loading
   * - For `required`: `false` = optional while loading, `true` = required while loading
   *
   * @default false
   */
  pendingValue?: boolean;
  /**
   * Debounce ms for re-evaluation.
   * @default 300
   */
  debounceMs?: number;
}

/**
 * Condition that resolves asynchronously via a custom function.
 *
 * Two mutually exclusive forms:
 * - `asyncFunctionName`: name of a function registered in `customFnConfig.asyncConditions`.
 *   JSON-serializable; suitable for configs loaded from APIs, databases, or OpenAPI.
 * - `asyncFn`: inline async function. NOT JSON-serializable; for code-only configs.
 *
 * Exactly one of `asyncFunctionName` or `asyncFn` must be set.
 *
 * The function is resolved reactively — when dependent form values change,
 * the function is re-evaluated (with debouncing). The result is cached per
 * evaluation to avoid redundant calls.
 *
 * Since `LogicFn` must return `boolean` synchronously, this condition uses
 * a signal-based async resolution pattern internally.
 *
 * @public
 */
export type AsyncCondition =
  | (AsyncConditionBase & {
      /** Name of the registered async condition function */
      asyncFunctionName: string;
      /** Inline form is forbidden when `asyncFunctionName` is set */
      asyncFn?: never;
    })
  | (AsyncConditionBase & {
      /**
       * Inline async condition function. Mutually exclusive with `asyncFunctionName`.
       *
       * NOT JSON-serializable — for code-only configs. For configs loaded
       * from JSON / OpenAPI / databases, use `asyncFunctionName` to reference
       * a function registered in `customFnConfig.asyncConditions`.
       */
      asyncFn: AsyncConditionFunction;
      /** Registered form is forbidden when `asyncFn` is set */
      asyncFunctionName?: never;
    });

/**
 * Logical AND — all sub-conditions must be true.
 *
 * @public
 */
export interface AndCondition {
  type: 'and';
  /** Sub-conditions that must all evaluate to true */
  conditions: ConditionalExpression[];
}

/**
 * Logical OR — at least one sub-condition must be true.
 *
 * @public
 */
export interface OrCondition {
  type: 'or';
  /** Sub-conditions where at least one must evaluate to true */
  conditions: ConditionalExpression[];
}

/**
 * Discriminated union of all conditional expression types.
 *
 * Each variant only allows the properties relevant to its type,
 * providing compile-time safety against invalid property combinations.
 *
 * @public
 */
export type ConditionalExpression =
  | FieldValueCondition
  | CustomCondition
  | JavascriptCondition
  | HttpCondition
  | AsyncCondition
  | AndCondition
  | OrCondition;
