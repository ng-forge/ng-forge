import { z } from 'zod';
import { ConditionalExpressionSchema } from '../logic/conditional-expression.schema';

/**
 * Schema for asynchronous validator configurations.
 *
 * Original interface:
 * ```typescript
 * interface AsyncValidatorConfig extends BaseValidatorConfig {
 *   type: 'customAsync';
 *   functionName: string;
 *   params?: Record<string, unknown>;
 * }
 * ```
 *
 * Async validators require a functionName because async logic
 * cannot be serialized in JSON configs.
 */
export const AsyncValidatorConfigSchema = z.object({
  /**
   * Discriminant for async validators.
   */
  type: z.literal('customAsync'),

  /**
   * Name of a registered async validator function.
   * The function must be registered in customFnConfig.asyncValidators.
   * Required because async logic cannot be inline in JSON.
   */
  functionName: z.string(),

  /**
   * Parameters passed to the async validator function.
   */
  params: z.record(z.string(), z.unknown()).optional(),

  /**
   * Condition for when this validator should be applied.
   */
  when: ConditionalExpressionSchema.optional(),
});

export type AsyncValidatorConfigSchemaType = z.infer<typeof AsyncValidatorConfigSchema>;
