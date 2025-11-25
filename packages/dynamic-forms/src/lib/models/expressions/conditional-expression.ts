export interface ConditionalExpression {
  /** Expression type */
  type: 'fieldValue' | 'formValue' | 'custom' | 'javascript' | 'and' | 'or';

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

  /** Array of sub-conditions for 'and' and 'or' types */
  conditions?: ConditionalExpression[];
}
