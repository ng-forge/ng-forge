import { z } from 'zod';
import { IonicLeafFieldSchema } from './ionic-leaf-field.schema.js';
import { createContainerSchemas } from '../../src/lib/schemas/containers/factories.js';
import { createFormConfigSchema } from '../../src/lib/schemas/form/form-config.schema.js';
import { IonicColorSchema, IonicLabelPlacementSchema } from './props/index.js';

const containerSchemas = createContainerSchemas({
  leafFieldSchema: IonicLeafFieldSchema,
});

export const IonicPageFieldSchema = containerSchemas.PageFieldSchema;
export const IonicRowFieldSchema = containerSchemas.RowFieldSchema;
export const IonicGroupFieldSchema = containerSchemas.GroupFieldSchema;
export const IonicArrayFieldSchema = containerSchemas.ArrayFieldSchema;
export const IonicFieldSchema = containerSchemas.AllFieldsSchema;

export type IonicFieldSchemaType = z.infer<typeof IonicFieldSchema>;

/**
 * Ionic form default props.
 */
export const IonicFormDefaultPropsSchema = z.object({
  color: IonicColorSchema.optional(),
  labelPlacement: IonicLabelPlacementSchema.optional(),
});

/**
 * Complete Ionic form configuration schema.
 */
export const IonicFormConfigSchema = createFormConfigSchema(IonicFieldSchema, IonicFormDefaultPropsSchema);

export type IonicFormConfigSchemaType = z.infer<typeof IonicFormConfigSchema>;
