import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { FieldOptionsSchema } from '../../../src/lib/schemas/common/field-option.schema';
import { MatMultiCheckboxPropsSchema } from '../props/mat-multi-checkbox-props.schema';

/**
 * Schema for Material multi-checkbox field.
 *
 * Original interface:
 * ```typescript
 * interface MatMultiCheckboxField<T> extends BaseValueField<MatMultiCheckboxProps, T[]> {
 *   type: 'multi-checkbox';
 *   readonly options: readonly FieldOption<T>[];
 *   value?: T[];
 *   placeholder?: DynamicText;
 * }
 * ```
 */
export const MatMultiCheckboxFieldSchema = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('multi-checkbox'),

  /**
   * Initial selected values (array).
   */
  value: z.array(z.unknown()).optional(),

  /**
   * Placeholder/helper text.
   */
  placeholder: DynamicTextSchema.optional(),

  /**
   * Options for the checkbox group.
   */
  options: FieldOptionsSchema,

  /**
   * Material-specific multi-checkbox properties.
   */
  props: MatMultiCheckboxPropsSchema.optional(),
});

export type MatMultiCheckboxFieldSchemaType = z.infer<typeof MatMultiCheckboxFieldSchema>;
