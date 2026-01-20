import { z, ZodTypeAny } from 'zod';
import { FormOptionsSchema } from './form-options.schema';
import { SchemaDefinitionsArraySchema } from './schema-definition.schema';
import { ValidationMessagesSchema } from '../validation/validation-messages.schema';

/**
 * Creates a FormConfig schema with the specified field schema and props schema.
 *
 * Original interface:
 * ```typescript
 * interface FormConfig<TFields, TValue, TProps> {
 *   fields: TFields;
 *   schema?: Schema<TValue>;
 *   options?: FormOptions;
 *   schemas?: SchemaDefinition[];
 *   defaultValidationMessages?: ValidationMessages;
 *   customFnConfig?: CustomFnConfig;
 *   submission?: SubmissionConfig<TValue>;
 *   defaultProps?: TProps;
 * }
 * ```
 *
 * Note: Some properties (schema, customFnConfig, submission) contain
 * functions or non-serializable types and are not included in the JSON schema.
 * These must be provided at runtime when using the form config.
 *
 * @param fieldSchema - Schema for the fields array
 * @param propsSchema - Schema for default props (optional)
 * @returns FormConfig schema
 */
export function createFormConfigSchema<TField extends ZodTypeAny, TProps extends ZodTypeAny = z.ZodObject<Record<string, never>>>(
  fieldSchema: TField,
  propsSchema?: TProps,
) {
  const baseSchema = z.object({
    /**
     * Array of field definitions that make up the form.
     */
    fields: z.array(fieldSchema),

    /**
     * Form-level options controlling behavior.
     */
    options: FormOptionsSchema.optional(),

    /**
     * Reusable schema definitions for validation patterns.
     */
    schemas: SchemaDefinitionsArraySchema.optional(),

    /**
     * Default validation messages for the form.
     * Used as fallback when fields don't specify custom messages.
     */
    defaultValidationMessages: ValidationMessagesSchema.optional(),

    /**
     * Note: customFnConfig is not included because it contains
     * function references that cannot be serialized to JSON.
     * Functions must be provided at runtime.
     */

    /**
     * Note: submission is not included because it contains
     * a function that cannot be serialized to JSON.
     * Submit handler must be provided at runtime.
     */

    /**
     * Note: schema (Standard Schema validator) is not included
     * because it's a runtime object that cannot be serialized.
     * Form-level schema validation must be provided at runtime.
     */
  });

  if (propsSchema) {
    return baseSchema.extend({
      /**
       * Default props applied to all fields in the form.
       */
      defaultProps: propsSchema.optional(),
    });
  }

  return baseSchema;
}

/**
 * Base FormConfig schema without field type constraints.
 * Use createFormConfigSchema() with a specific field schema for type safety.
 */
export const BaseFormConfigSchema = z.object({
  fields: z.array(z.any()),
  options: FormOptionsSchema.optional(),
  schemas: SchemaDefinitionsArraySchema.optional(),
  defaultValidationMessages: ValidationMessagesSchema.optional(),
});

export type BaseFormConfigSchemaType = z.infer<typeof BaseFormConfigSchema>;
