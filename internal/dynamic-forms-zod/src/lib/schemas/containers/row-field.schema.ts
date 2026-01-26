import { z, ZodTypeAny } from 'zod';
import { BaseFieldDefSchema } from '../field/field-def.schema';

/**
 * Creates a RowField schema with the specified child field schema.
 *
 * Original interface:
 * ```typescript
 * interface RowField<TFields extends readonly RowAllowedChildren[]> extends FieldDef<never> {
 *   type: 'row';
 *   readonly fields: TFields;
 *   readonly label?: never;
 *   readonly meta?: never;
 * }
 * ```
 *
 * RowFields create horizontal layouts for grouping fields.
 * Allowed children: groups, array, leaf fields except hidden (but NOT pages, rows, or hidden fields).
 *
 * @param childFieldSchema - Schema for allowed child fields
 * @returns RowField schema
 */
export function createRowFieldSchema<T extends ZodTypeAny>(childFieldSchema: T) {
  return BaseFieldDefSchema.omit({
    label: true,
    meta: true,
  }).extend({
    /**
     * Field type discriminant.
     */
    type: z.literal('row'),

    /**
     * Array of child fields within this row.
     */
    fields: z.array(childFieldSchema),
  });
}

/**
 * Base RowField schema without recursive field reference.
 * Use createRowFieldSchema() with a leaf field schema for full functionality.
 */
export const BaseRowFieldSchema = BaseFieldDefSchema.omit({
  label: true,
  meta: true,
}).extend({
  type: z.literal('row'),
  fields: z.array(z.any()),
});

export type BaseRowFieldSchemaType = z.infer<typeof BaseRowFieldSchema>;
