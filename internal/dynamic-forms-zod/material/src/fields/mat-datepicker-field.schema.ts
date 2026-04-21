import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { MatDatepickerPropsSchema } from '../props/mat-datepicker-props.schema';
import { nullableValueRefine } from '../../../src/lib/schemas/field/nullable-value.refinement';

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
const MatDatepickerFieldSchemaObject = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('datepicker'),

  nullable: z.boolean().optional(),
  /**
   * Initial date value (ISO string in JSON configs).
   */
  value: DateValueSchema.nullable().optional(),

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

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * `value: null` is only valid when `nullable: true`.
 * The raw `MatDatepickerFieldSchemaObject` is used internally for discriminatedUnion composition.
 */
export const MatDatepickerFieldSchema = MatDatepickerFieldSchemaObject.superRefine(nullableValueRefine);
export { MatDatepickerFieldSchemaObject };

export type MatDatepickerFieldSchemaType = z.infer<typeof MatDatepickerFieldSchema>;
