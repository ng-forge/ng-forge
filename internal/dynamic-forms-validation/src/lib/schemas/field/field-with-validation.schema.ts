import { z } from 'zod';
import { ValidatorsArraySchema } from '../validation/validator-config.schema';
import { ValidationMessagesSchema } from '../validation/validation-messages.schema';
import { LogicArraySchema } from '../logic/logic-config.schema';
import { ConditionalExpressionSchema } from '../logic/conditional-expression.schema';

/**
 * Schema application types.
 */
export const SchemaApplicationTypeSchema = z.enum(['apply', 'applyWhen', 'applyWhenValue', 'applyEach']);

/**
 * Schema for schema application configuration.
 * Used for applying reusable validation schemas to fields.
 */
export const SchemaApplicationConfigSchema = z.object({
  /**
   * How to apply the schema.
   */
  type: SchemaApplicationTypeSchema,

  /**
   * Schema name (reference) or inline schema definition.
   * For JSON configs, this is always a string reference.
   */
  schema: z.string(),

  /**
   * Condition for 'applyWhen' type.
   */
  condition: ConditionalExpressionSchema.optional(),

  /**
   * Type predicate expression for 'applyWhenValue' type.
   */
  typePredicate: z.string().optional(),
});

/**
 * Schema for field validation mixin properties.
 *
 * Original interface:
 * ```typescript
 * interface FieldWithValidation {
 *   required?: boolean;
 *   email?: boolean;
 *   min?: number;
 *   max?: number;
 *   minLength?: number;
 *   maxLength?: number;
 *   pattern?: string | RegExp;
 *   validators?: ValidatorConfig[];
 *   validationMessages?: ValidationMessages;
 *   logic?: LogicConfig[];
 *   derivation?: string;
 *   schemas?: SchemaApplicationConfig[];
 * }
 * ```
 *
 * These properties can be mixed into value fields for validation.
 */
export const FieldWithValidationSchema = z.object({
  // Simple validation rules (ease of use)
  /**
   * Whether the field is required.
   */
  required: z.boolean().optional(),

  /**
   * Whether to apply email validation.
   */
  email: z.boolean().optional(),

  /**
   * Minimum numeric value.
   */
  min: z.number().optional(),

  /**
   * Maximum numeric value.
   */
  max: z.number().optional(),

  /**
   * Minimum string length.
   */
  minLength: z.number().optional(),

  /**
   * Maximum string length.
   */
  maxLength: z.number().optional(),

  /**
   * Regex pattern for validation.
   *
   * **Important:** In JSON configs, patterns must be strings, not RegExp objects.
   * RegExp literals like `/^[a-z]+$/` must be written as `"^[a-z]+$"`.
   *
   * @example
   * ```typescript
   * // TypeScript (allows RegExp)
   * pattern: /^[a-z]+$/
   *
   * // JSON config (string only)
   * "pattern": "^[a-z]+$"
   * ```
   */
  pattern: z.string().optional(),

  // Advanced validation configuration
  /**
   * Array of advanced validator configurations.
   */
  validators: ValidatorsArraySchema.optional(),

  /**
   * Custom error messages for validation failures.
   */
  validationMessages: ValidationMessagesSchema.optional(),

  // Logic rules
  /**
   * Array of logic configurations for conditional behavior.
   */
  logic: LogicArraySchema.optional(),

  /**
   * Shorthand for simple computed/derived fields.
   * JavaScript expression that computes the field value.
   */
  derivation: z.string().optional(),

  // Schema applications
  /**
   * Array of schema applications for reusable validation patterns.
   */
  schemas: z.array(SchemaApplicationConfigSchema).optional(),
});

/**
 * Inferred type for field with validation mixin.
 */
export type FieldWithValidationSchemaType = z.infer<typeof FieldWithValidationSchema>;
