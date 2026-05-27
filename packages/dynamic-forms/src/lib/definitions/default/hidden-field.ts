import { FieldDef } from '../base/field-def';

/**
 * Scalar types supported by hidden fields.
 * These are the primitive value types that can be stored.
 */
export type HiddenScalar = string | number | boolean;

/**
 * All value types supported by hidden fields.
 * Supports both scalar values and arrays of scalars for storing
 * multiple IDs or similar data.
 */
export type HiddenValue = HiddenScalar | HiddenScalar[];

/**
 * Hidden field definition for storing values without rendering UI.
 *
 * @typeParam TValue - The type of value stored (must be HiddenValue compatible)
 */
export interface HiddenField<TValue extends HiddenValue = HiddenValue> extends FieldDef<never> {
  /** Discriminant for hidden field type */
  type: 'hidden';

  /**
   * The value to store in the form.
   * This is required - a hidden field without a value serves no purpose.
   */
  value: TValue;
}

/**
 * Type guard to check if a field is a hidden field.
 *
 * @param field - The field to check
 * @returns True if the field is a HiddenField
 */
export function isHiddenField(field: FieldDef<unknown>): field is HiddenField {
  return field.type === 'hidden';
}
