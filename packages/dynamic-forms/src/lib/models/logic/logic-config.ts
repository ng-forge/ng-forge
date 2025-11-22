import { ConditionalExpression } from '../expressions/conditional-expression';

/**
 * Configuration for signal forms logic functions (hidden, readonly, etc.)
 */
export interface LogicConfig {
  /** Logic type identifier */
  type: 'hidden' | 'readonly' | 'disabled' | 'required';

  /** Boolean expression or static value */
  condition: ConditionalExpression | boolean;
}
