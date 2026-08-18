import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { FieldOptionsSchema } from '../../../src/lib/schemas/common/field-option.schema';
import { MatSelectPropsSchema } from '../props/mat-select-props.schema';
import { nullableValueRefine } from '../../../src/lib/schemas/field/nullable-value.refinement';

/**
 * Schema for Material select field.
 *
 * Original interface:
 * ```typescript
 * interface MatSelectField<T> extends BaseValueField<MatSelectProps, T> {
 *   type: 'select';
 *   readonly options: readonly FieldOption<T>[];
 *   value?: T;
 *   placeholder?: DynamicText;
 * }
 * ```
 */
/**
 * Raw ZodObject. Used internally by `MatLeafFieldSchema`'s `z.discriminatedUnion`,
 * which rejects `ZodEffects`. The cross-field nullable contract (`value: null`
 * requires `nullable: true`) is enforced on the public `MatSelectFieldSchema` export
 * below via `.superRefine(nullableValueRefine)`, and redundantly at the
 * union level. Direct parse on this raw schema is not a public API.
 */
const MatSelectFieldSchemaObject = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('select'),

  nullable: z.boolean().optional(),
  /**
   * Initial value for the select.
   * Can be single value or array if multiple is enabled.
   */
  value: z.unknown().nullable().optional(),

  /**
   * Placeholder text (can also be in props).
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Options for the select dropdown.
   */
  options: FieldOptionsSchema,

  /**
   * Material-specific select properties.
   */
  props: MatSelectPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * `value: null` is only valid when `nullable: true`.
 * The raw `MatSelectFieldSchemaObject` is used internally for discriminatedUnion composition.
 */
export const MatSelectFieldSchema = MatSelectFieldSchemaObject.superRefine(nullableValueRefine);
export { MatSelectFieldSchemaObject };

export type MatSelectFieldSchemaType = z.infer<typeof MatSelectFieldSchema>;
