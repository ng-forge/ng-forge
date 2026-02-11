import { z, ZodTypeAny } from 'zod';
import { BaseFieldDefSchema } from '../field/field-def.schema';
import { ConditionalExpressionSchema } from '../logic/conditional-expression.schema';

/**
 * Options for creating container schemas.
 */
export interface ContainerSchemaOptions<T extends ZodTypeAny> {
  /**
   * Schema for leaf fields (UI-specific value fields).
   */
  leafFieldSchema: T;
}

/**
 * Generic field type for recursive structures.
 * Exported for use in type declarations.
 */
export interface GenericField {
  type: string;
  key: string;
  fields?: GenericField[];
  [key: string]: unknown;
}

/**
 * Container logic config schema (only 'hidden' type allowed).
 * Used by all container types: page, row, group, and array.
 */
const ContainerLogicSchema = z.object({
  type: z.literal('hidden'),
  condition: z.union([ConditionalExpressionSchema, z.boolean()]),
});

/**
 * Creates all container field schemas with proper recursive definitions.
 *
 * This factory creates container schemas that can nest other containers
 * and leaf fields. The TypeScript types enforce specific nesting constraints:
 *
 * | Container | Allowed Children                      | NOT Allowed |
 * |-----------|---------------------------------------|-------------|
 * | Page      | rows, groups, arrays, leaves          | pages       |
 * | Row       | groups, arrays, leaves (except hidden)| pages, rows |
 * | Group     | rows, leaves                          | pages, groups|
 * | Array     | rows, groups, leaves                  | pages, arrays|
 *
 * **Limitation:** These nesting constraints are NOT enforced at runtime
 * by the Zod schemas due to the complexity of recursive discriminated unions.
 * The schemas accept any valid field structure. TypeScript type checking
 * provides compile-time enforcement when using the library with TS.
 *
 * For strict runtime validation of nesting rules, implement custom refinements
 * or use a validation layer on top of these schemas.
 *
 * @param options - Schema options including leaf field schema
 * @returns Object containing all container schemas
 */
export function createContainerSchemas<T extends ZodTypeAny>(options: ContainerSchemaOptions<T>) {
  const { leafFieldSchema } = options;

  // Create a recursive field schema that accepts any valid field structure
  // The type annotation prevents TypeScript circular reference issues
  const AnyFieldSchema: z.ZodType<GenericField> = z.lazy(() =>
    z.union([
      leafFieldSchema as z.ZodType<GenericField>,
      PageFieldSchema as z.ZodType<GenericField>,
      RowFieldSchema as z.ZodType<GenericField>,
      GroupFieldSchema as z.ZodType<GenericField>,
      ArrayFieldSchema as z.ZodType<GenericField>,
    ]),
  );

  // Container base without fields - explicitly forbids label and meta
  const ContainerBaseSchema = BaseFieldDefSchema.omit({
    label: true,
    meta: true,
  }).extend({
    // Explicitly forbid label on container fields
    // This makes Zod reject any value for these properties
    label: z.never().optional(),
    meta: z.never().optional(),
  });

  // Page can contain: rows, groups, arrays, leaves (no pages)
  // We validate structure rather than exact child types for simplicity
  const PageFieldSchema = ContainerBaseSchema.extend({
    type: z.literal('page'),
    fields: z.array(AnyFieldSchema),
    logic: z.array(ContainerLogicSchema).optional(),
    // Also forbid title (common mistake)
    title: z.never().optional(),
  });

  // Row can contain: groups, arrays, leaves (no pages, rows)
  // Rows support only 'hidden' logic type for conditional visibility
  const RowFieldSchema = ContainerBaseSchema.extend({
    type: z.literal('row'),
    fields: z.array(AnyFieldSchema),
    // Container logic - only 'hidden' type allowed (same as pages)
    logic: z.array(ContainerLogicSchema).optional(),
  });

  // Group can contain: rows, leaves (no pages, groups)
  // Groups support only 'hidden' logic type for conditional visibility
  const GroupFieldSchema = ContainerBaseSchema.extend({
    type: z.literal('group'),
    fields: z.array(AnyFieldSchema),
    // Container logic - only 'hidden' type allowed (same as pages)
    logic: z.array(ContainerLogicSchema).optional(),
  });

  // Array can contain: rows, groups, leaves (no pages, arrays)
  // Arrays support only 'hidden' logic type for conditional visibility
  // Also forbid template (common mistake - should use 'fields')
  const ArrayFieldSchema = ContainerBaseSchema.extend({
    type: z.literal('array'),
    fields: z.array(AnyFieldSchema),
    // Container logic - only 'hidden' type allowed (same as pages)
    logic: z.array(ContainerLogicSchema).optional(),
    template: z.never().optional(),
    minItems: z.never().optional(),
    maxItems: z.never().optional(),
  });

  // All fields union
  const AllFieldsSchema = AnyFieldSchema;

  return {
    PageFieldSchema,
    RowFieldSchema,
    GroupFieldSchema,
    ArrayFieldSchema,
    AllFieldsSchema,
  };
}

/**
 * Creates a union of all field types (containers + leaves).
 *
 * @param leafFieldSchema - Schema for leaf fields
 * @returns Union schema for all field types
 */
export function createAllFieldsSchema<T extends ZodTypeAny>(leafFieldSchema: T) {
  return createContainerSchemas({ leafFieldSchema }).AllFieldsSchema;
}
