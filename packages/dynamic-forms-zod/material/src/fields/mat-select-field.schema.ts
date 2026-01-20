import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { FieldOptionsSchema } from '../../../src/lib/schemas/common/field-option.schema';
import { MatSelectPropsSchema } from '../props/mat-select-props.schema';

/**
 * Schema for Material select field.
 *
 * Original interface:
 * ```typescript
 * interface MatSelectField<T> extends BaseValueField<MatSelectProps, T> {
 *   type: 'select';
 *   readonly options: readonly FieldOption<T>[];
 *   value?: T;
 *   placeholder?: DynamicText;
 * }
 * ```
 */
export const MatSelectFieldSchema = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('select'),

  /**
   * Initial value for the select.
   * Can be single value or array if multiple is enabled.
   */
  value: z.unknown().optional(),

  /**
   * Placeholder text (can also be in props).
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Options for the select dropdown.
   */
  options: FieldOptionsSchema,

  /**
   * Material-specific select properties.
   */
  props: MatSelectPropsSchema.optional(),
});

export type MatSelectFieldSchemaType = z.infer<typeof MatSelectFieldSchema>;
