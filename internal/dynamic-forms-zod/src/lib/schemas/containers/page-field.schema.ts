import { z, ZodTypeAny } from 'zod';
import { BaseFieldDefSchema } from '../field/field-def.schema';
import { ConditionalExpressionSchema } from '../logic/conditional-expression.schema';

/**
 * Schema for container logic configuration (only 'hidden' type allowed).
 * Shared by page, group, row, and array containers.
 */
export const ContainerLogicConfigSchema = z.object({
  type: z.literal('hidden'),
  condition: z.union([ConditionalExpressionSchema, z.boolean()]),
});

/**
 * @deprecated Use `ContainerLogicConfigSchema` instead.
 */
export const PageLogicConfigSchema = ContainerLogicConfigSchema;

/**
 * Creates a PageField schema with the specified child field schema.
 *
 * Original interface:
 * ```typescript
 * interface PageField<TFields extends readonly PageAllowedChildren[]> extends FieldDef<never> {
 *   type: 'page';
 *   readonly fields: TFields;
 *   readonly label?: never;
 *   readonly meta?: never;
 *   readonly logic?: PageLogicConfig[];
 * }
 * ```
 *
 * PageFields are top-level containers for multi-page/wizard forms.
 * Allowed children: rows, groups, array, leaf fields (but NOT other pages).
 *
 * @param childFieldSchema - Schema for allowed child fields
 * @returns PageField schema
 */
export function createPageFieldSchema<T extends ZodTypeAny>(childFieldSchema: T) {
  return BaseFieldDefSchema.omit({
    label: true,
    meta: true,
  }).extend({
    /**
     * Field type discriminant.
     */
    type: z.literal('page'),

    /**
     * Array of child fields within this page.
     */
    fields: z.array(childFieldSchema),

    /**
     * Page-specific logic (only 'hidden' is allowed).
     */
    logic: z.array(PageLogicConfigSchema).optional(),
  });
}

/**
 * Base PageField schema without recursive field reference.
 * Use createPageFieldSchema() with a leaf field schema for full functionality.
 */
export const BasePageFieldSchema = BaseFieldDefSchema.omit({
  label: true,
  meta: true,
}).extend({
  type: z.literal('page'),
  fields: z.array(z.any()),
  logic: z.array(PageLogicConfigSchema).optional(),
});

export type BasePageFieldSchemaType = z.infer<typeof BasePageFieldSchema>;
