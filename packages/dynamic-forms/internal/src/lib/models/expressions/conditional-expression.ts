import type { CustomFunction } from '../../core/expressions/custom-function-types';
import type { AsyncConditionFunction } from '../../core/expressions/async-custom-function-types';
import type { HttpRequestConfig } from '../http/http-request-config';

/** Comparison operators for field value and form value conditions. */
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

/** Condition that compares a specific field's value against an expected value. */
export interface FieldValueCondition {
  type: 'fieldValue';
  /** Path to the field whose value to compare */
  fieldPath: string;
  /** Comparison operator */
  operator: ComparisonOperator;
  /** Value to compare against */
  value?: unknown;
}

/** Condition that invokes a custom function. */
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
      /** Inline custom function. Mutually exclusive with `functionName`. */
      fn: CustomFunction;
      /** Registered form is forbidden when `fn` is set */
      functionName?: never;
    };

/** Condition that evaluates a JavaScript expression using the secure AST-based parser. */
export interface JavascriptCondition {
  type: 'javascript';
  /** JavaScript expression string to evaluate */
  expression: string;
}

/** Condition that evaluates based on an HTTP response from a remote server. */
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
   * @default false
   */
  pendingValue?: boolean;
  /** Cache duration in ms for HTTP responses. @default 30000 */
  cacheDurationMs?: number;
  /**
   * Debounce time in milliseconds for re-evaluation when dependent form values change.
   *
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
   * @default false
   */
  pendingValue?: boolean;
  /**
   * Debounce ms for re-evaluation.
   *
   * @default 300
   */
  debounceMs?: number;
}

/** Condition that resolves asynchronously via a custom function. */
export type AsyncCondition =
  | (AsyncConditionBase & {
      /** Name of the registered async condition function */
      asyncFunctionName: string;
      /** Inline form is forbidden when `asyncFunctionName` is set */
      asyncFn?: never;
    })
  | (AsyncConditionBase & {
      /** Inline async condition function. Mutually exclusive with `asyncFunctionName`. */
      asyncFn: AsyncConditionFunction;
      /** Registered form is forbidden when `asyncFn` is set */
      asyncFunctionName?: never;
    });

/** Logical AND — all sub-conditions must be true. */
export interface AndCondition {
  type: 'and';
  /** Sub-conditions that must all evaluate to true */
  conditions: ConditionalExpression[];
}

/** Logical OR — at least one sub-condition must be true. */
export interface OrCondition {
  type: 'or';
  /** Sub-conditions where at least one must evaluate to true */
  conditions: ConditionalExpression[];
}

/** Discriminated union of all conditional expression types. */
export type ConditionalExpression =
  | FieldValueCondition
  | CustomCondition
  | JavascriptCondition
  | HttpCondition
  | AsyncCondition
  | AndCondition
  | OrCondition;
