import { ConditionalExpression } from '../expressions/conditional-expression';

export interface LogicConfig {
  /** Logic type identifier */
  type: 'hidden' | 'readonly' | 'disabled' | 'required';

  /** Boolean expression or static value */
  condition: ConditionalExpression | boolean;
}
