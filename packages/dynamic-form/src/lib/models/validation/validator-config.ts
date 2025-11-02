import { ConditionalExpression } from '../expressions/conditional-expression';

/**
 * Configuration for signal forms validator functions that can be serialized from API
 */
export interface ValidatorConfig {
  /** Validator type identifier */
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';

  /** Static value for the validator (e.g., min value, pattern) */
  value?: number | string | RegExp;

  /** Dynamic value expression that evaluates to validator parameter */
  expression?: string;

  /** Custom error message */
  errorMessage?: string;

  /** Conditional logic for when validator applies */
  when?: ConditionalExpression;
}
