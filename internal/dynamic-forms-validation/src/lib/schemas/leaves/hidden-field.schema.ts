import { z } from 'zod';
import { BaseFieldDefSchema } from '../field/field-def.schema';

/**
 * Schema for hidden field scalar values.
 */
export const HiddenScalarSchema = z.union([z.string(), z.number(), z.boolean()]);

/**
 * Schema for hidden field values - can be scalar or array of scalars.
 */
export const HiddenValueSchema = z.union([HiddenScalarSchema, z.array(HiddenScalarSchema)]);

/**
 * Schema for HiddenField - stores values without UI rendering.
 *
 * Original interface:
 * ```typescript
 * interface HiddenField<TValue extends HiddenValue = HiddenValue> extends FieldDef<never> {
 *   type: 'hidden';
 *   value: TValue;
 * }
 * ```
 *
 * HiddenFields store IDs, metadata, or computed values without user interaction.
 */
export const HiddenFieldSchema = BaseFieldDefSchema.omit({
  label: true,
  meta: true,
  disabled: true,
  readonly: true,
  hidden: true,
  tabIndex: true,
  col: true,
  excludeValueIfHidden: true,
  excludeValueIfDisabled: true,
  excludeValueIfReadonly: true,
}).extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('hidden'),

  /**
   * The value to store. Required for hidden fields.
   */
  value: HiddenValueSchema,
});

/**
 * Inferred type for HiddenField.
 */
export type HiddenFieldSchemaType = z.infer<typeof HiddenFieldSchema>;
