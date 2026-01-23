import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatDatepickerPropsSchema } from '../props/mat-datepicker-props.schema';

/**
 * Schema for date values - can be ISO string or Date serialization.
 * Note: In JSON configs, dates are represented as ISO strings.
 */
export const DateValueSchema = z.union([z.string(), z.null()]);

/**
 * Schema for Material datepicker field.
 *
 * Original interface:
 * ```typescript
 * interface MatDatepickerField extends BaseValueField<MatDatepickerProps, Date | string> {
 *   type: 'datepicker';
 *   value?: Date | string;
 *   minDate?: Date | string | null;
 *   maxDate?: Date | string | null;
 *   startAt?: Date | null;
 *   placeholder?: DynamicText;
 * }
 * ```
 *
 * Note: In JSON configs, Date values are represented as ISO 8601 strings.
 */
export const MatDatepickerFieldSchema = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('datepicker'),

  /**
   * Initial date value (ISO string in JSON configs).
   */
  value: DateValueSchema.optional(),

  /**
   * Minimum selectable date.
   */
  minDate: DateValueSchema.optional(),

  /**
   * Maximum selectable date.
   */
  maxDate: DateValueSchema.optional(),

  /**
   * Date to start the calendar view at.
   */
  startAt: DateValueSchema.optional(),

  /**
   * Placeholder text.
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Material-specific datepicker properties.
   */
  props: MatDatepickerPropsSchema.optional(),
});

export type MatDatepickerFieldSchemaType = z.infer<typeof MatDatepickerFieldSchema>;
