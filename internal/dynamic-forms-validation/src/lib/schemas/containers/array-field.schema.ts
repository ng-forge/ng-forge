import { z, ZodTypeAny } from 'zod';
import { BaseFieldDefSchema } from '../field/field-def.schema';
import { ContainerLogicConfigSchema } from './page-field.schema';

/**
 * Creates an ArrayField schema with the specified child field schema.
 *
 * Original interface:
 * ```typescript
 * interface ArrayField<TFields extends readonly ArrayAllowedChildren[]> extends FieldDef<never> {
 *   type: 'array';
 *   readonly fields: TFields;
 *   readonly label?: never;
 *   readonly meta?: never;
 *   readonly logic?: ContainerLogicConfig[];
 * }
 * ```
 *
 * ArrayFields define repeatable field templates (FormArray in Angular).
 * The `fields` array defines the TEMPLATE for each array item, not actual instances.
 * Array items are created/removed at runtime.
 *
 * Allowed children: rows, groups, leaf fields (but NOT pages or other arrays).
 *
 * @param childFieldSchema - Schema for allowed child fields
 * @returns ArrayField schema
 */
export function createArrayFieldSchema<T extends ZodTypeAny>(childFieldSchema: T) {
  return BaseFieldDefSchema.omit({
    label: true,
    meta: true,
  }).extend({
    /**
     * Field type discriminant.
     */
    type: z.literal('array'),

    /**
     * Template field(s) for array items.
     * Each array item will contain these fields.
     */
    fields: z.array(childFieldSchema),

    /**
     * Container logic (only 'hidden' is allowed).
     */
    logic: z.array(ContainerLogicConfigSchema).optional(),
  });
}

/**
 * Base ArrayField schema without recursive field reference.
 * Use createArrayFieldSchema() with a leaf field schema for full functionality.
 */
export const BaseArrayFieldSchema = BaseFieldDefSchema.omit({
  label: true,
  meta: true,
}).extend({
  type: z.literal('array'),
  fields: z.array(z.any()),
  logic: z.array(ContainerLogicConfigSchema).optional(),
});

export type BaseArrayFieldSchemaType = z.infer<typeof BaseArrayFieldSchema>;
