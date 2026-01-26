import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { FieldOptionsSchema } from '../../../src/lib/schemas/common/field-option.schema';
import { MatRadioPropsSchema } from '../props/mat-radio-props.schema';

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
export const MatRadioFieldSchema = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('radio'),

  /**
   * Initial selected value.
   */
  value: z.unknown().optional(),

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

export type MatRadioFieldSchemaType = z.infer<typeof MatRadioFieldSchema>;
