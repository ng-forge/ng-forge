import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatTogglePropsSchema } from '../props/mat-toggle-props.schema';

/**
 * Schema for Material toggle (slide toggle) field.
 *
 * Original interface:
 * ```typescript
 * interface MatToggleField extends BaseCheckedField<MatToggleProps> {
 *   type: 'toggle';
 *   value?: boolean;
 *   placeholder?: DynamicText;
 * }
 * ```
 */
export const MatToggleFieldSchema = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('toggle'),

  /**
   * Initial toggle state.
   */
  value: z.boolean().optional(),

  /**
   * Placeholder/helper text.
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Material-specific toggle properties.
   */
  props: MatTogglePropsSchema.optional(),
});

export type MatToggleFieldSchemaType = z.infer<typeof MatToggleFieldSchema>;
