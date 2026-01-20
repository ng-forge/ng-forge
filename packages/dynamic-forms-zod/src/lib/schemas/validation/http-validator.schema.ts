import { z } from 'zod';
import { ConditionalExpressionSchema } from '../logic/conditional-expression.schema';

/**
 * Schema for HTTP validator configurations.
 *
 * Original interface:
 * ```typescript
 * interface HttpValidatorConfig extends BaseValidatorConfig {
 *   type: 'customHttp';
 *   functionName: string;
 *   params?: Record<string, unknown>;
 * }
 * ```
 *
 * HTTP validators make API calls for server-side validation.
 * They require a functionName that returns the HTTP config.
 */
export const HttpValidatorConfigSchema = z.object({
  /**
   * Discriminant for HTTP validators.
   */
  type: z.literal('customHttp'),

  /**
   * Name of a registered HTTP validator config function.
   * The function must be registered in customFnConfig.httpValidators.
   * Required because HTTP configuration cannot be inline in JSON.
   */
  functionName: z.string(),

  /**
   * Parameters passed to the HTTP validator function.
   */
  params: z.record(z.string(), z.unknown()).optional(),

  /**
   * Condition for when this validator should be applied.
   */
  when: ConditionalExpressionSchema.optional(),
});

export type HttpValidatorConfigSchemaType = z.infer<typeof HttpValidatorConfigSchema>;
