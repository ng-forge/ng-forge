/**
 * Conditional expression that can be evaluated against form values
 */
export interface ConditionalExpression {
  /** Expression type */
  type: 'fieldValue' | 'formValue' | 'custom' | 'javascript';

  /** Field path for fieldValue type */
  fieldPath?: string;

  /** Comparison operator */
  operator?:
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

  /** Value to compare against */
  value?: unknown;

  /** JavaScript expression for custom logic */
  expression?: string;

  /** Multiple conditions with logical operators */
  conditions?: {
    logic: 'and' | 'or';
    expressions: ConditionalExpression[];
  };
}
