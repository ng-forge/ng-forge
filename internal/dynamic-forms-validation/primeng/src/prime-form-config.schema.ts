import { z } from 'zod';
import { PrimeLeafFieldSchema } from './prime-leaf-field.schema';
import { createContainerSchemas } from '../../src/lib/schemas/containers/factories';
import { createFormConfigSchema } from '../../src/lib/schemas/form/form-config.schema';

const containerSchemas = createContainerSchemas({
  leafFieldSchema: PrimeLeafFieldSchema,
});

export const PrimePageFieldSchema = containerSchemas.PageFieldSchema;
export const PrimeRowFieldSchema = containerSchemas.RowFieldSchema;
export const PrimeGroupFieldSchema = containerSchemas.GroupFieldSchema;
export const PrimeArrayFieldSchema = containerSchemas.ArrayFieldSchema;
export const PrimeFieldSchema = containerSchemas.AllFieldsSchema;

export type PrimeFieldSchemaType = z.infer<typeof PrimeFieldSchema>;

/**
 * PrimeNG form default props.
 */
export const PrimeFormDefaultPropsSchema = z.object({
  styleClass: z.string().optional(),
});

/**
 * Complete PrimeNG form configuration schema.
 */
export const PrimeFormConfigSchema = createFormConfigSchema(PrimeFieldSchema, PrimeFormDefaultPropsSchema);

export type PrimeFormConfigSchemaType = z.infer<typeof PrimeFormConfigSchema>;
