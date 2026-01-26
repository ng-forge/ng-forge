import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatCheckboxPropsSchema } from '../props/mat-checkbox-props.schema';

/**
 * Schema for Material checkbox field.
 *
 * Original interface:
 * ```typescript
 * interface MatCheckboxField extends BaseCheckedField<MatCheckboxProps> {
 *   type: 'checkbox';
 *   value?: boolean;
 *   placeholder?: DynamicText;
 * }
 * ```
 */
export const MatCheckboxFieldSchema = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('checkbox'),

  /**
   * Initial checked state.
   */
  value: z.boolean().optional(),

  /**
   * Placeholder/helper text.
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Material-specific checkbox properties.
   */
  props: MatCheckboxPropsSchema.optional(),
});

export type MatCheckboxFieldSchemaType = z.infer<typeof MatCheckboxFieldSchema>;
