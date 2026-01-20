import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatSliderPropsSchema } from '../props/mat-slider-props.schema';

/**
 * Schema for Material slider field.
 *
 * Original interface:
 * ```typescript
 * interface MatSliderField extends BaseValueField<MatSliderProps, number> {
 *   type: 'slider';
 *   value?: number;
 *   minValue?: number;
 *   maxValue?: number;
 *   step?: number;
 *   placeholder?: DynamicText;
 * }
 * ```
 */
export const MatSliderFieldSchema = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('slider'),

  /**
   * Initial slider value.
   */
  value: z.number().optional(),

  /**
   * Minimum slider value.
   */
  minValue: z.number().optional(),

  /**
   * Maximum slider value.
   */
  maxValue: z.number().optional(),

  /**
   * Step increment.
   */
  step: z.number().positive().optional(),

  /**
   * Placeholder/helper text.
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Material-specific slider properties.
   */
  props: MatSliderPropsSchema.optional(),
});

export type MatSliderFieldSchemaType = z.infer<typeof MatSliderFieldSchema>;
