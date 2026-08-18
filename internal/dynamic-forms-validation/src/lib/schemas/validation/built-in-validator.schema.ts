import { z } from 'zod';
import { ConditionalExpressionSchema } from '../logic/conditional-expression.schema';

/**
 * Built-in validator types that map to Angular's built-in validators.
 */
export const BuiltInValidatorTypeSchema = z.enum(['required', 'email', 'min', 'max', 'minLength', 'maxLength', 'pattern']);

export type BuiltInValidatorType = z.infer<typeof BuiltInValidatorTypeSchema>;

/**
 * Schema for built-in validator configurations.
 *
 * Original interface:
 * ```typescript
 * interface BuiltInValidatorConfig extends BaseValidatorConfig {
 *   type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern';
 *   value?: number | string | RegExp;
 *   expression?: string;
 * }
 * ```
 *
 * Note: RegExp is represented as a string pattern in JSON configs.
 */
export const BuiltInValidatorConfigSchema = z.object({
  /**
   * The type of built-in validator.
   */
  type: BuiltInValidatorTypeSchema,

  /**
   * Static value for the validator parameter.
   * - min/max: number threshold
   * - minLength/maxLength: length limit
   * - pattern: regex pattern string
   * - required/email: not used
   */
  value: z.union([z.number(), z.string()]).optional(),

  /**
   * Dynamic expression that evaluates to the validator parameter.
   * Alternative to static value for computed validation rules.
   */
  expression: z.string().optional(),

  /**
   * Condition for when this validator should be applied.
   * If omitted, validator is always active.
   */
  when: ConditionalExpressionSchema.optional(),
});

export type BuiltInValidatorConfigSchemaType = z.infer<typeof BuiltInValidatorConfigSchema>;
