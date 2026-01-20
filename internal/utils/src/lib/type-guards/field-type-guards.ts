/**
 * Generic type guard utilities for field-like objects.
 *
 * These are structural type guards that work with any object that has the
 * expected shape, without requiring specific dynamic-forms types.
 */

/** Default container field types used in dynamic forms */
export const CONTAINER_FIELD_TYPES = ['page', 'row', 'group', 'array'] as const;

/**
 * Checks if a field is a container type (page, row, group, or array).
 *
 * Container fields have child fields and don't contribute values directly
 * to the form model.
 *
 * @param field - Any object with a `type` property
 * @param containerTypes - Optional custom list of container types (defaults to page, row, group, array)
 * @returns True if the field's type matches a container type
 *
 * @example
 * ```typescript
 * const field = { type: 'group', fields: [...] };
 * if (isContainerField(field)) {
 *   // process children
 * }
 * ```
 *
 * @public
 */
export function isContainerField(field: { type: string }, containerTypes: readonly string[] = CONTAINER_FIELD_TYPES): boolean {
  return containerTypes.includes(field.type);
}

/**
 * Checks if a field is a leaf type (not a container).
 *
 * Leaf fields are value-bearing or display fields that don't have children.
 *
 * @param field - Any object with a `type` property
 * @param containerTypes - Optional custom list of container types
 * @returns True if the field is not a container type
 *
 * @example
 * ```typescript
 * const field = { type: 'text', key: 'name' };
 * if (isLeafField(field)) {
 *   // process as value or display field
 * }
 * ```
 *
 * @public
 */
export function isLeafField(field: { type: string }, containerTypes: readonly string[] = CONTAINER_FIELD_TYPES): boolean {
  return !isContainerField(field, containerTypes);
}

/**
 * Type guard to check if an object has a `fields` property that is an array.
 *
 * This is a structural check that works with any object, making it useful
 * for generic field traversal without requiring specific type imports.
 *
 * @param field - Any value to check
 * @returns True if the value is an object with an array `fields` property
 *
 * @example
 * ```typescript
 * function traverse(field: unknown): void {
 *   if (hasChildFields(field)) {
 *     // TypeScript knows field.fields is an array
 *     field.fields.forEach(child => traverse(child));
 *   }
 * }
 * ```
 *
 * @public
 */
export function hasChildFields(field: unknown): field is { fields: unknown[] } {
  return typeof field === 'object' && field !== null && 'fields' in field && Array.isArray((field as { fields: unknown }).fields);
}

/**
 * Type guard to check if an object has a `fields` property that is a record (object).
 *
 * Some container fields may use objects instead of arrays for named children.
 *
 * @param field - Any value to check
 * @returns True if the value is an object with a non-array object `fields` property
 *
 * @public
 */
export function hasChildFieldsRecord(field: unknown): field is { fields: Record<string, unknown> } {
  return (
    typeof field === 'object' &&
    field !== null &&
    'fields' in field &&
    typeof (field as { fields: unknown }).fields === 'object' &&
    (field as { fields: unknown }).fields !== null &&
    !Array.isArray((field as { fields: unknown }).fields)
  );
}
