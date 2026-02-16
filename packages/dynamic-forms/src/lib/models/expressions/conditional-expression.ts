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
  | AndCondition
  | OrCondition;
