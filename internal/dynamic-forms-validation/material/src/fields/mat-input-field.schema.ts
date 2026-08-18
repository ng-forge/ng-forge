import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatInputPropsSchema } from '../props/mat-input-props.schema';
import { nullableValueRefine } from '../../../src/lib/schemas/field/nullable-value.refinement';

/**
 * Schema for Material input field.
 *
 * Original interface:
 * ```typescript
 * interface MatInputField extends BaseValueField<MatInputProps, string> {
 *   type: 'input';
 *   value?: string;
 *   placeholder?: DynamicText;
 * }
 * ```
 */
/**
 * Raw ZodObject. Used internally by `MatLeafFieldSchema`'s `z.discriminatedUnion`,
 * which rejects `ZodEffects`. The cross-field nullable contract (`value: null`
 * requires `nullable: true`) is enforced on the public `MatInputFieldSchema` export
 * below via `.superRefine(nullableValueRefine)`, and redundantly at the
 * union level. Direct parse on this raw schema is not a public API.
 */
const MatInputFieldSchemaObject = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('input'),

  nullable: z.boolean().optional(),
  /**
   * Initial value for the input.
   */
  value: z.string().nullable().optional(),

  /**
   * Placeholder text (can also be in props).
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Material-specific input properties.
   */
  props: MatInputPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * `value: null` is only valid when `nullable: true`.
 * The raw `MatInputFieldSchemaObject` is used internally for discriminatedUnion composition.
 */
export const MatInputFieldSchema = MatInputFieldSchemaObject.superRefine(nullableValueRefine);
export { MatInputFieldSchemaObject };

export type MatInputFieldSchemaType = z.infer<typeof MatInputFieldSchema>;
