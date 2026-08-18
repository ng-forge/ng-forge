import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { FieldOptionsSchema } from '../../../src/lib/schemas/common/field-option.schema';
import { MatRadioPropsSchema } from '../props/mat-radio-props.schema';
import { nullableValueRefine } from '../../../src/lib/schemas/field/nullable-value.refinement';

/**
 * Schema for Material radio field.
 *
 * Original interface:
 * ```typescript
 * interface MatRadioField<T> extends BaseValueField<MatRadioProps, T> {
 *   type: 'radio';
 *   readonly options: readonly FieldOption<T>[];
 *   value?: T;
 *   placeholder?: DynamicText;
 * }
 * ```
 */
/**
 * Raw ZodObject. Used internally by `MatLeafFieldSchema`'s `z.discriminatedUnion`,
 * which rejects `ZodEffects`. The cross-field nullable contract (`value: null`
 * requires `nullable: true`) is enforced on the public `MatRadioFieldSchema` export
 * below via `.superRefine(nullableValueRefine)`, and redundantly at the
 * union level. Direct parse on this raw schema is not a public API.
 */
const MatRadioFieldSchemaObject = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('radio'),

  nullable: z.boolean().optional(),
  /**
   * Initial selected value.
   */
  value: z.unknown().nullable().optional(),

  /**
   * Placeholder/helper text.
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Options for the radio group.
   */
  options: FieldOptionsSchema,

  /**
   * Material-specific radio properties.
   */
  props: MatRadioPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * `value: null` is only valid when `nullable: true`.
 * The raw `MatRadioFieldSchemaObject` is used internally for discriminatedUnion composition.
 */
export const MatRadioFieldSchema = MatRadioFieldSchemaObject.superRefine(nullableValueRefine);
export { MatRadioFieldSchemaObject };

export type MatRadioFieldSchemaType = z.infer<typeof MatRadioFieldSchema>;
