import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatTextareaPropsSchema } from '../props/mat-textarea-props.schema';
import { nullableValueRefine } from '../../../src/lib/schemas/field/nullable-value.refinement';

/**
 * Schema for Material textarea field.
 *
 * Original interface:
 * ```typescript
 * interface MatTextareaField extends BaseValueField<MatTextareaProps, string> {
 *   type: 'textarea';
 *   value?: string;
 *   placeholder?: DynamicText;
 * }
 * ```
 */
/**
 * Raw ZodObject. Used internally by `MatLeafFieldSchema`'s `z.discriminatedUnion`,
 * which rejects `ZodEffects`. The cross-field nullable contract (`value: null`
 * requires `nullable: true`) is enforced on the public `MatTextareaFieldSchema` export
 * below via `.superRefine(nullableValueRefine)`, and redundantly at the
 * union level. Direct parse on this raw schema is not a public API.
 */
const MatTextareaFieldSchemaObject = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('textarea'),

  nullable: z.boolean().optional(),
  /**
   * Initial value for the textarea.
   */
  value: z.string().nullable().optional(),

  /**
   * Placeholder text (can also be in props).
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Material-specific textarea properties.
   */
  props: MatTextareaPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * `value: null` is only valid when `nullable: true`.
 * The raw `MatTextareaFieldSchemaObject` is used internally for discriminatedUnion composition.
 */
export const MatTextareaFieldSchema = MatTextareaFieldSchemaObject.superRefine(nullableValueRefine);
export { MatTextareaFieldSchemaObject };

export type MatTextareaFieldSchemaType = z.infer<typeof MatTextareaFieldSchema>;
