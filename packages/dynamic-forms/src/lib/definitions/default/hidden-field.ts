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
 * Hidden fields participate in the form schema and contribute to form values,
 * but do not render any visible component. They are useful for:
 * - Storing IDs when updating existing records
 * - Persisting metadata that shouldn't be user-editable
 * - Tracking computed values that need to be submitted
 *
 * Unlike the `hidden` property on other fields (which hides a rendered field),
 * this field type renders nothing at all - it's a componentless field.
 *
 * @example
 * ```typescript
 * // Store a record ID for updates
 * const idField: HiddenField<string> = {
 *   type: 'hidden',
 *   key: 'id',
 *   value: '550e8400-e29b-41d4-a716-446655440000',
 * };
 *
 * // Store multiple tag IDs
 * const tagIdsField: HiddenField<number[]> = {
 *   type: 'hidden',
 *   key: 'tagIds',
 *   value: [1, 2, 3],
 * };
 * ```
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
