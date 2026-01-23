import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatTextareaPropsSchema } from '../props/mat-textarea-props.schema';

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
export const MatTextareaFieldSchema = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('textarea'),

  /**
   * Initial value for the textarea.
   */
  value: z.string().optional(),

  /**
   * Placeholder text (can also be in props).
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Material-specific textarea properties.
   */
  props: MatTextareaPropsSchema.optional(),
});

export type MatTextareaFieldSchemaType = z.infer<typeof MatTextareaFieldSchema>;
