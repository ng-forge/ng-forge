import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { FieldOptionsSchema } from '../../../src/lib/schemas/common/field-option.schema';
import { MatMultiCheckboxPropsSchema } from '../props/mat-multi-checkbox-props.schema';
import { nullableValueRefine } from '../../../src/lib/schemas/field/nullable-value.refinement';

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
/**
 * Raw ZodObject. Used internally by `MatLeafFieldSchema`'s `z.discriminatedUnion`,
 * which rejects `ZodEffects`. The cross-field nullable contract (`value: null`
 * requires `nullable: true`) is enforced on the public `MatMultiCheckboxFieldSchema` export
 * below via `.superRefine(nullableValueRefine)`, and redundantly at the
 * union level. Direct parse on this raw schema is not a public API.
 */
const MatMultiCheckboxFieldSchemaObject = BaseFieldDefSchema.merge(FieldWithValidationSchema).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('multi-checkbox'),

  nullable: z.boolean().optional(),
  /**
   * Initial selected values (array).
   */
  value: z.array(z.unknown()).nullable().optional(),

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

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * `value: null` is only valid when `nullable: true`.
 * The raw `MatMultiCheckboxFieldSchemaObject` is used internally for discriminatedUnion composition.
 */
export const MatMultiCheckboxFieldSchema = MatMultiCheckboxFieldSchemaObject.superRefine(nullableValueRefine);
export { MatMultiCheckboxFieldSchemaObject };

export type MatMultiCheckboxFieldSchemaType = z.infer<typeof MatMultiCheckboxFieldSchema>;
