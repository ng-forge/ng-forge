import { z } from 'zod';
import { ValidatorsArraySchema } from '../validation/validator-config.schema';
import { LogicArraySchema } from '../logic/logic-config.schema';
import { SchemaApplicationConfigSchema } from '../field/field-with-validation.schema';

/**
 * Schema for reusable schema definitions.
 *
 * Original interface:
 * ```typescript
 * interface SchemaDefinition {
 *   name: string;
 *   description?: string;
 *   pathPattern?: string;
 *   validators?: ValidatorConfig[];
 *   logic?: LogicConfig[];
 *   subSchemas?: SchemaApplicationConfig[];
 * }
 * ```
 *
 * SchemaDefinitions allow creating reusable validation patterns
 * that can be applied to multiple fields.
 */
export const SchemaDefinitionSchema = z.object({
  /**
   * Unique identifier for the schema.
   * Used to reference the schema in SchemaApplicationConfig.
   */
  name: z.string(),

  /**
   * Human-readable description of what this schema validates.
   */
  description: z.string().optional(),

  /**
   * Field path pattern for automatic schema application.
   * Supports glob-like patterns.
   */
  pathPattern: z.string().optional(),

  /**
   * Validators to apply to fields using this schema.
   */
  validators: ValidatorsArraySchema.optional(),

  /**
   * Logic rules to apply to fields using this schema.
   */
  logic: LogicArraySchema.optional(),

  /**
   * Nested schema applications for composing schemas.
   */
  subSchemas: z.array(SchemaApplicationConfigSchema).optional(),
});

/**
 * Schema for an array of schema definitions.
 */
export const SchemaDefinitionsArraySchema = z.array(SchemaDefinitionSchema);

export type SchemaDefinitionSchemaType = z.infer<typeof SchemaDefinitionSchema>;
