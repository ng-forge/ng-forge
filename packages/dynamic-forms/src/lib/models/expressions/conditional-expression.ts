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

// TODO(@ng-forge): remove deprecated code in next minor
/**
 * Condition that compares the entire form value against an expected value.
 *
 * @deprecated Use `FieldValueCondition` for specific field checks, or
 * `JavascriptCondition` with an expression for complex form-level comparisons.
 * Will be removed in a future minor version.
 *
 * @public
 */
export interface FormValueCondition {
  type: 'formValue';
  /** Comparison operator */
  operator: ComparisonOperator;
  /** Value to compare against */
  value?: unknown;
}

/**
 * Condition that invokes a registered custom function by name.
 *
 * The `expression` field holds the registered function name (not a JS expression).
 * Register functions via `customFnConfig.customFunctions`.
 *
 * @public
 */
export interface CustomCondition {
  type: 'custom';
  /** Name of the registered custom function to invoke */
  expression: string;
}

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
}

/**
 * Condition that evaluates based on a registered async function.
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
export interface AsyncCondition {
  type: 'async';
  /** Name of the registered async condition function */
  asyncFunctionName: string;
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
  | FormValueCondition
  | CustomCondition
  | JavascriptCondition
  | HttpCondition
  | AsyncCondition
  | AndCondition
  | OrCondition;
