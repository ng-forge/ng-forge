import { FieldDef } from '../../definitions/base/field-def';
import { isPageField } from '../../definitions/default/page-field';
import { isRowField } from '../../definitions/default/row-field';
import { isGroupField } from '../../definitions/default/group-field';
import { isArrayField } from '../../definitions/default/array-field';
import { ContainerFieldTypes, LeafFieldTypes, RegisteredFieldTypes } from '../registry/field-registry';

/**
 * Type guard to check if a field definition has child fields.
 * This is a looser check that works with FieldDef<unknown> without requiring RegisteredFieldTypes.
 */
export function hasChildFields<T>(
  field: FieldDef<T>,
): field is FieldDef<T> & { fields: FieldDef<unknown>[] | Record<string, FieldDef<unknown>> } {
  return 'fields' in field && field.fields != null;
}

/** Container field type names */
const CONTAINER_TYPES = new Set(['page', 'row', 'group', 'array']);

/**
 * Type guard to check if a field is a container field (page, row, group, or array)
 * Container fields have a 'fields' property and don't contribute values directly.
 * This overload works with RegisteredFieldTypes for full type narrowing.
 */
export function isContainerField(field: RegisteredFieldTypes): field is ContainerFieldTypes;
/**
 * Type guard to check if a field is a container field (page, row, group, or array).
 * This overload works with any FieldDef for looser type checking.
 */
export function isContainerField(field: FieldDef<unknown>): boolean;
export function isContainerField(field: FieldDef<unknown> | RegisteredFieldTypes): boolean {
  return CONTAINER_TYPES.has(field.type);
}

/**
 * Type guard to check if a field is a leaf field (value or display field)
 * Leaf fields don't have children and either contribute values or display content
 */
export function isLeafField(field: RegisteredFieldTypes): field is LeafFieldTypes {
  return !isContainerField(field);
}

/**
 * Type guard to check if a field has a value property (value-bearing field)
 * These fields contribute to the form value output
 * Note: Using `unknown` in the Extract condition to match any value type
 */
export function isValueBearingField(field: RegisteredFieldTypes): field is Extract<RegisteredFieldTypes, { value: unknown }> {
  return 'value' in field;
}

/**
 * Type guard to check if a field is excluded from form values (display-only field)
 * Currently this includes text fields and any other fields without a value property
 */
export function isDisplayOnlyField(field: RegisteredFieldTypes): boolean {
  return field.type === 'text' || isContainerField(field);
}

// Re-export the specific type guards for convenience
export { isPageField, isRowField, isGroupField, isArrayField };
