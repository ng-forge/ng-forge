import { z } from 'zod';
import { ConditionalExpressionSchema } from '../logic/conditional-expression.schema';

/**
 * Schema for custom synchronous validator configurations.
 *
 * Original interface:
 * ```typescript
 * interface CustomValidatorConfig extends BaseValidatorConfig {
 *   type: 'custom';
 *   functionName?: string;
 *   params?: Record<string, unknown>;
 *   expression?: string;
 *   kind?: string;
 *   errorParams?: Record<string, string>;
 * }
 * ```
 *
 * Must have either functionName OR expression, but not both.
 */
export const CustomValidatorConfigSchema = z
  .object({
    /**
     * Discriminant for custom validators.
     */
    type: z.literal('custom'),

    /**
     * Name of a registered custom validator function.
     * The function must be registered in customFnConfig.validators.
     */
    functionName: z.string().optional(),

    /**
     * Parameters passed to the custom validator function.
     */
    params: z.record(z.string(), z.unknown()).optional(),

    /**
     * JavaScript expression to evaluate for validation.
     * Alternative to functionName for inline validation logic.
     * Has access to: fieldValue, formValue, fieldPath
     */
    expression: z.string().optional(),

    /**
     * Error kind identifier for linking to validation messages.
     * Used as the key in ValidationErrors object.
     */
    kind: z.string().optional(),

    /**
     * Error context parameters for message interpolation.
     * Values can reference form values using expressions.
     */
    errorParams: z.record(z.string(), z.string()).optional(),

    /**
     * Condition for when this validator should be applied.
     */
    when: ConditionalExpressionSchema.optional(),
  })
  .refine((data) => data.functionName || data.expression, {
    message: 'Custom validator must have either functionName or expression defined',
    path: ['functionName'],
  });

export type CustomValidatorConfigSchemaType = z.infer<typeof CustomValidatorConfigSchema>;
