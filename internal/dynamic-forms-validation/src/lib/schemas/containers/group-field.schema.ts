import { z, ZodTypeAny } from 'zod';
import { BaseFieldDefSchema } from '../field/field-def.schema';
import { ContainerLogicConfigSchema } from './page-field.schema';

/**
 * Creates a GroupField schema with the specified child field schema.
 *
 * Original interface:
 * ```typescript
 * interface GroupField<TFields extends readonly GroupAllowedChildren[]> extends FieldDef<never> {
 *   type: 'group';
 *   readonly fields: TFields;
 *   readonly label?: never;
 *   readonly meta?: never;
 *   readonly logic?: ContainerLogicConfig[];
 * }
 * ```
 *
 * GroupFields create nested form groups (FormGroup in Angular).
 * Allowed children: rows, leaf fields (but NOT pages or other groups).
 *
 * @param childFieldSchema - Schema for allowed child fields
 * @returns GroupField schema
 */
export function createGroupFieldSchema<T extends ZodTypeAny>(childFieldSchema: T) {
  return BaseFieldDefSchema.omit({
    label: true,
    meta: true,
  }).extend({
    /**
     * Field type discriminant.
     */
    type: z.literal('group'),

    /**
     * Array of child fields within this group.
     */
    fields: z.array(childFieldSchema),

    /**
     * Container logic (only 'hidden' is allowed).
     */
    logic: z.array(ContainerLogicConfigSchema).optional(),
  });
}

/**
 * Base GroupField schema without recursive field reference.
 * Use createGroupFieldSchema() with a leaf field schema for full functionality.
 */
export const BaseGroupFieldSchema = BaseFieldDefSchema.omit({
  label: true,
  meta: true,
}).extend({
  type: z.literal('group'),
  fields: z.array(z.any()),
  logic: z.array(ContainerLogicConfigSchema).optional(),
});

export type BaseGroupFieldSchemaType = z.infer<typeof BaseGroupFieldSchema>;
