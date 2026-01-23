import { z } from 'zod';
import { ConditionalExpressionSchema } from '../logic/conditional-expression.schema';

/**
 * Base schema for validator configurations with optional conditional application.
 */
const BaseValidatorSchema = z.object({
  /**
   * Condition for when this validator should be applied.
   * If omitted, validator is always active.
   */
  when: ConditionalExpressionSchema.optional(),
});

/**
 * Schema for built-in validator parameters.
 */
const BuiltInValidatorParamsSchema = z.object({
  /**
   * Static value for the validator parameter.
   */
  value: z.union([z.number(), z.string()]).optional(),

  /**
   * Dynamic expression that evaluates to the validator parameter.
   */
  expression: z.string().optional(),
});

/**
 * Union schema for all validator configuration types.
 *
 * Original type:
 * ```typescript
 * type ValidatorConfig =
 *   | BuiltInValidatorConfig
 *   | CustomValidatorConfig
 *   | AsyncValidatorConfig
 *   | HttpValidatorConfig;
 * ```
 *
 * Uses discriminatedUnion for efficient parsing based on 'type' field.
 */
export const ValidatorConfigSchema = z.discriminatedUnion('type', [
  // Built-in validators
  BaseValidatorSchema.merge(BuiltInValidatorParamsSchema).extend({
    type: z.literal('required'),
  }),
  BaseValidatorSchema.merge(BuiltInValidatorParamsSchema).extend({
    type: z.literal('email'),
  }),
  BaseValidatorSchema.merge(BuiltInValidatorParamsSchema).extend({
    type: z.literal('min'),
  }),
  BaseValidatorSchema.merge(BuiltInValidatorParamsSchema).extend({
    type: z.literal('max'),
  }),
  BaseValidatorSchema.merge(BuiltInValidatorParamsSchema).extend({
    type: z.literal('minLength'),
  }),
  BaseValidatorSchema.merge(BuiltInValidatorParamsSchema).extend({
    type: z.literal('maxLength'),
  }),
  BaseValidatorSchema.merge(BuiltInValidatorParamsSchema).extend({
    type: z.literal('pattern'),
  }),
  // Custom synchronous validators
  BaseValidatorSchema.extend({
    type: z.literal('custom'),
    /**
     * Name of a registered custom validator function.
     */
    functionName: z.string().optional(),
    /**
     * Parameters passed to the custom validator function.
     */
    params: z.record(z.string(), z.unknown()).optional(),
    /**
     * JavaScript expression to evaluate for validation.
     */
    expression: z.string().optional(),
    /**
     * Error kind identifier for linking to validation messages.
     */
    kind: z.string().optional(),
    /**
     * Error context parameters for message interpolation.
     */
    errorParams: z.record(z.string(), z.string()).optional(),
  }),
  // Async validators
  BaseValidatorSchema.extend({
    type: z.literal('customAsync'),
    /**
     * Name of a registered async validator function. Required.
     */
    functionName: z.string(),
    /**
     * Parameters passed to the async validator function.
     */
    params: z.record(z.string(), z.unknown()).optional(),
  }),
  // HTTP validators
  BaseValidatorSchema.extend({
    type: z.literal('customHttp'),
    /**
     * Name of a registered HTTP validator config function. Required.
     */
    functionName: z.string(),
    /**
     * Parameters passed to the HTTP validator function.
     */
    params: z.record(z.string(), z.unknown()).optional(),
  }),
]);

/**
 * Schema for an array of validator configurations.
 */
export const ValidatorsArraySchema = z.array(ValidatorConfigSchema);

/**
 * Inferred type for a single validator config.
 */
export type ValidatorConfigSchemaType = z.infer<typeof ValidatorConfigSchema>;

/**
 * Inferred type for an array of validators.
 */
export type ValidatorsArraySchemaType = z.infer<typeof ValidatorsArraySchema>;

// Re-export individual schemas for direct usage
export { BuiltInValidatorConfigSchema } from './built-in-validator.schema';
export { CustomValidatorConfigSchema } from './custom-validator.schema';
export { AsyncValidatorConfigSchema } from './async-validator.schema';
export { HttpValidatorConfigSchema } from './http-validator.schema';
