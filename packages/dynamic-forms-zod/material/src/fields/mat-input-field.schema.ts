import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatInputPropsSchema } from '../props/mat-input-props.schema';

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
export const MatInputFieldSchema = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('input'),

  /**
   * Initial value for the input.
   */
  value: z.string().optional(),

  /**
   * Placeholder text (can also be in props).
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Material-specific input properties.
   */
  props: MatInputPropsSchema.optional(),
});

export type MatInputFieldSchemaType = z.infer<typeof MatInputFieldSchema>;
