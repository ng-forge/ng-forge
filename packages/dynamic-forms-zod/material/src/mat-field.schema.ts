import { z } from 'zod';
import { MatLeafFieldSchema } from './mat-leaf-field.schema';
import { createContainerSchemas } from '../../src/lib/schemas/containers/factories';

/**
 * Create container schemas with Material leaf fields.
 */
const containerSchemas = createContainerSchemas({
  leafFieldSchema: MatLeafFieldSchema,
});

/**
 * Material PageField schema.
 * Pages are top-level containers for multi-page/wizard forms.
 */
export const MatPageFieldSchema = containerSchemas.PageFieldSchema;

/**
 * Material RowField schema.
 * Rows create horizontal layouts for grouping fields.
 */
export const MatRowFieldSchema = containerSchemas.RowFieldSchema;

/**
 * Material GroupField schema.
 * Groups create nested form groups (Angular FormGroup).
 */
export const MatGroupFieldSchema = containerSchemas.GroupFieldSchema;

/**
 * Material ArrayField schema.
 * Arrays define repeatable field templates (Angular FormArray).
 */
export const MatArrayFieldSchema = containerSchemas.ArrayFieldSchema;

/**
 * Union of all Material field types (containers + leaves).
 *
 * This schema validates any field in a Material form configuration,
 * including both leaf fields and container fields with proper
 * recursive nesting support.
 */
export const MatFieldSchema = containerSchemas.AllFieldsSchema;

/**
 * Inferred type for any Material field.
 */
export type MatFieldSchemaType = z.infer<typeof MatFieldSchema>;

/**
 * List of all Material field type names.
 */
export const MatFieldTypes = [
  // Container types
  'page',
  'row',
  'group',
  'array',

  // Leaf types
  'text',
  'hidden',
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'multi-checkbox',
  'toggle',
  'slider',
  'datepicker',
  'button',
  'submit',
  'next',
  'previous',
  'addArrayItem',
  'removeArrayItem',
] as const;

export type MatFieldType = (typeof MatFieldTypes)[number];
