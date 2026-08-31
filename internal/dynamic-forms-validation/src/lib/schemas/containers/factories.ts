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

  // Recursive field schema, discriminated on `type`.
  //
  // This MUST stay a discriminated union. A plain `z.union` picks an option by
  // trying each in turn, and a `z.object` option does not stop at a failed
  // `type` literal — it goes on to parse `fields`, recursing through the whole
  // subtree before reporting the failure it already knew about. Every nesting
  // level then re-parses its subtree once per preceding option, so validation
  // cost grows exponentially with depth: a config nested 7 deep took over five
  // seconds, and one nested 10 deep took minutes. Discriminating on `type`
  // selects the single matching option up front, which makes it linear.
  //
  // The type annotation prevents TypeScript circular reference issues.
  const AnyFieldSchema: z.ZodType<GenericField> = z.lazy(() =>
    z.discriminatedUnion('type', [
      leafFieldSchema as unknown as z.core.$ZodTypeDiscriminable,
      PageFieldSchema,
      RowFieldSchema,
      GroupFieldSchema,
      ArrayFieldSchema,
    ]),
  ) as z.ZodType<GenericField>;

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

  // Array button config for simplified API
  const ArrayButtonConfigSchema = z.object({
    label: z.string().optional(),
    props: z.record(z.string(), z.unknown()).optional(),
  });

  // Schema for array-allowed children: excludes pages and nested arrays from templates.
  // Uses a refinement on AnyFieldSchema since the recursive structure makes static exclusion complex.
  const ArrayAllowedChildSchema: z.ZodType<GenericField> = z.lazy(() =>
    AnyFieldSchema.refine((field) => field.type !== 'page' && field.type !== 'array', {
      message: 'Array templates cannot contain page or array fields. Only leaf fields, rows, and groups are allowed.',
    }),
  );

  /**
   * Array field: full API (`fields`) or simplified API (`template` + `value`).
   *
   * The two APIs are ONE schema with a refinement rather than a union of two,
   * because a discriminated union cannot carry two options under the same
   * `type` value. Expressing "exactly one of fields/template" as a refinement
   * also reports the actual mistake, where a union could only say that neither
   * option matched.
   */
  const ArrayFieldSchema = ContainerBaseSchema.extend({
    type: z.literal('array'),
    // Full API: explicit item definitions.
    fields: z.array(AnyFieldSchema).optional(),
    // Simplified API: single field (primitive array) or array of fields (object array).
    // Only ArrayAllowedChildren (leaf fields, rows, groups) are valid — no pages or nested arrays.
    template: z.union([ArrayAllowedChildSchema, z.array(ArrayAllowedChildSchema)]).optional(),
    // Initial values for the array
    value: z.array(z.unknown()).optional(),
    // Button customization or opt-out (false to disable)
    addButton: z.union([ArrayButtonConfigSchema, z.literal(false)]).optional(),
    removeButton: z.union([ArrayButtonConfigSchema, z.literal(false)]).optional(),
    logic: z.array(ContainerLogicSchema).optional(),
    // Array length validation
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(0).optional(),
    // The array size properties are minLength/maxLength. These are the common
    // wrong spelling, and naming them keeps the mistake from being silently
    // stripped. Previously only the simplified API rejected them.
    minItems: z.never().optional(),
    maxItems: z.never().optional(),
  })
    .superRefine((field, ctx) => {
      const hasFields = field.fields !== undefined;
      const hasTemplate = field.template !== undefined;

      if (hasFields && hasTemplate) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Array has BOTH "fields" and "template". These are mutually exclusive: use "fields" for the full API, or "template" + "value" for the simplified API.',
        });
      } else if (!hasFields && !hasTemplate) {
        ctx.addIssue({
          code: 'custom',
          message: 'Array is MISSING both "fields" and "template". Use "fields" (full API) or "template" + "value" (simplified API).',
        });
      }
    })
    .meta({
      // The refinement above is invisible to JSON Schema generation, and the
      // generated schema is authoring guidance for a model. Two optional
      // properties with no stated relationship reads as "pass either, both or
      // neither", which is exactly the mistake the refinement rejects at
      // runtime. Restating the rule as `oneOf` keeps the published schema
      // saying what the validator enforces — the union of two array schemas
      // used to express this, and collapsing them to one schema lost it.
      description:
        'Array field. Use EXACTLY ONE of "fields" (full API: explicit item definitions) or "template" (simplified API: one field, or an array of fields, repeated per item). Never both, never neither.',
      oneOf: [
        { required: ['fields'], not: { required: ['template'] } },
        { required: ['template'], not: { required: ['fields'] } },
      ],
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
