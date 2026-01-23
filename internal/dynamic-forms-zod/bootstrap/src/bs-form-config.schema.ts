import { z } from 'zod';
import { BsLeafFieldSchema } from './bs-leaf-field.schema';
import { createContainerSchemas } from '../../src/lib/schemas/containers/factories';
import { createFormConfigSchema } from '../../src/lib/schemas/form/form-config.schema';
import { BsSizeSchema } from './props/bs-common-props.schema';

const containerSchemas = createContainerSchemas({
  leafFieldSchema: BsLeafFieldSchema,
});

export const BsPageFieldSchema = containerSchemas.PageFieldSchema;
export const BsRowFieldSchema = containerSchemas.RowFieldSchema;
export const BsGroupFieldSchema = containerSchemas.GroupFieldSchema;
export const BsArrayFieldSchema = containerSchemas.ArrayFieldSchema;
export const BsFieldSchema = containerSchemas.AllFieldsSchema;

export type BsFieldSchemaType = z.infer<typeof BsFieldSchema>;

/**
 * Bootstrap form default props.
 */
export const BsFormDefaultPropsSchema = z.object({
  size: BsSizeSchema.optional(),
  floatingLabel: z.boolean().optional(),
});

/**
 * Complete Bootstrap form configuration schema.
 */
export const BsFormConfigSchema = createFormConfigSchema(BsFieldSchema, BsFormDefaultPropsSchema);

export type BsFormConfigSchemaType = z.infer<typeof BsFormConfigSchema>;
