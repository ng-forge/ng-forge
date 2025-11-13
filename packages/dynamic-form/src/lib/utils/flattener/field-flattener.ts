import { FieldDef, isRowField } from '../../definitions';
import { isGroupField } from '../../definitions/default/group-field';
import { isArrayField } from '../../definitions/default/array-field';
import { FieldTypeDefinition, getFieldValueHandling } from '../../models/field-type';

/**
 * Represents a field definition that has been processed through the flattening algorithm.
 *
 * Guarantees that the field has a valid key property, either from the original
 * field definition or auto-generated during the flattening process.
 *
 * @public
 */
export interface FlattenedField extends FieldDef<unknown> {
  /** Guaranteed non-empty key for form binding and field identification */
  readonly key: string;
}

/**
 * Flattens a hierarchical field structure into a linear array for form processing.
 *
 * Handles different field types with specific flattening strategies:
 * - **Page fields**: Children are flattened and merged into the result (no wrapper)
 * - **Row fields**: Children are flattened and merged into the result (no wrapper)
 * - **Group fields**: Maintains group structure with flattened children nested under the group key
 * - **Array fields**: Maintains array structure with flattened children nested under the array key
 * - **Other fields**: Pass through unchanged with guaranteed key generation
 *
 * Auto-generates keys for fields missing the key property to ensure form binding works correctly.
 *
 * @param fields - Array of field definitions that may contain nested structures
 * @param registry - Field type registry for determining value handling behavior
 * @returns Flattened array of field definitions with guaranteed keys
 *
 * @example
 * ```typescript
 * const hierarchicalFields = [
 *   {
 *     type: 'row',
 *     fields: [
 *       { type: 'input', key: 'firstName' },
 *       { type: 'input', key: 'lastName' }
 *     ]
 *   },
 *   {
 *     type: 'group',
 *     key: 'address',
 *     fields: [
 *       { type: 'input', key: 'street' },
 *       { type: 'input', key: 'city' }
 *     ]
 *   }
 * ];
 *
 * const flattened = flattenFields(hierarchicalFields);
 * // Result: [
 * //   { type: 'input', key: 'firstName' },
 * //   { type: 'input', key: 'lastName' },
 * //   { type: 'group', key: 'address', fields: [...] }
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * // Auto-key generation for fields without keys
 * const fieldsWithoutKeys = [
 *   { type: 'input', label: 'Name' },
 *   { type: 'button', label: 'Submit' }
 * ];
 *
 * const flattened = flattenFields(fieldsWithoutKeys);
 * // Result: [
 * //   { type: 'input', label: 'Name', key: 'auto_field_0' },
 * //   { type: 'button', label: 'Submit', key: 'auto_field_1' }
 * // ]
 * ```
 *
 * @public
 */
export function flattenFields(fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>): FlattenedField[] {
  const result: FlattenedField[] = [];
  let autoKeyCounter = 0;

  for (const field of fields) {
    const valueHandling = getFieldValueHandling(field.type, registry);

    if (valueHandling === 'flatten' && 'fields' in field) {
      // Flatten children to current level
      if (field.fields) {
        // Handle both array (page/row fields) and object (group fields)
        // Type assertion: fields can be unknown[] from container field generics, but we know they're FieldDef[]
        const fieldsArray = Array.isArray(field.fields) ? field.fields : Object.values(field.fields);
        const flattenedChildren = flattenFields(fieldsArray as FieldDef<unknown>[], registry);
        result.push(...flattenedChildren);
      }
    } else if (isGroupField(field)) {
      // Groups always maintain their structure (even if they have 'include' handling)
      // Type assertion: After isGroupField guard, we know fields contains FieldDef instances
      const childFieldsArray = Object.values(field.fields) as FieldDef<unknown>[];
      const flattenedChildren = flattenFields(childFieldsArray, registry);

      // Add only the group field with its flattened children, not the children separately
      result.push({
        ...field,
        fields: flattenedChildren,
        key: field.key || `auto_group_${autoKeyCounter++}`,
      } as FlattenedField);
    } else if (isArrayField(field)) {
      // Arrays always maintain their structure (even if they have 'include' handling)
      // Type assertion: After isArrayField guard, we know fields contains FieldDef instances
      const childFieldsArray = Object.values(field.fields) as FieldDef<unknown>[];
      const flattenedChildren = flattenFields(childFieldsArray, registry);

      // Add only the array field with its flattened children, not the children separately
      result.push({
        ...field,
        fields: flattenedChildren,
        key: field.key || `auto_array_${autoKeyCounter++}`,
      } as FlattenedField);
    } else {
      // All other fields (include/exclude) maintain their structure
      // The value handling will be processed later in schema creation
      const key = field.key || `auto_field_${autoKeyCounter++}`;
      result.push({
        ...field,
        key,
      } as FlattenedField);
    }
  }

  return result;
}

/**
 * Flattens fields for DOM rendering, preserving structural container fields.
 *
 * Unlike {@link flattenFields}, this function keeps row fields in the structure
 * so they can render their container elements in the DOM. This is essential for
 * the grid system to work correctly.
 *
 * The difference from `flattenFields`:
 * - **Row fields**: Preserved in structure with flattened children (for grid layout)
 * - **Page fields**: Still flattened (handled by page orchestrator)
 * - **Group/Array fields**: Same behavior (preserved with flattened children)
 *
 * @param fields - Array of field definitions that may contain nested structures
 * @param registry - Field type registry for determining value handling behavior
 * @returns Flattened array with row containers preserved
 *
 * @example
 * ```typescript
 * const fields = [
 *   {
 *     type: 'row',
 *     fields: [
 *       { type: 'input', key: 'firstName' },
 *       { type: 'input', key: 'lastName' }
 *     ]
 *   }
 * ];
 *
 * const rendered = flattenFieldsForRendering(fields, registry);
 * // Result: [
 * //   {
 * //     type: 'row',
 * //     fields: [
 * //       { type: 'input', key: 'firstName' },
 * //       { type: 'input', key: 'lastName' }
 * //     ]
 * //   }
 * // ]
 * // The row field is preserved so it can render its <div class="df-row"> container
 * ```
 *
 * @public
 */
export function flattenFieldsForRendering(fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>): FlattenedField[] {
  const result: FlattenedField[] = [];
  let autoKeyCounter = 0;

  for (const field of fields) {
    const valueHandling = getFieldValueHandling(field.type, registry);

    // Special handling for row fields: preserve them in structure for DOM rendering
    if (isRowField(field)) {
      if (field.fields) {
        const fieldsArray = Array.isArray(field.fields) ? field.fields : Object.values(field.fields);
        const flattenedChildren = flattenFieldsForRendering(fieldsArray as FieldDef<unknown>[], registry);

        // Keep the row field with its flattened children
        result.push({
          ...field,
          fields: flattenedChildren,
          key: field.key || `auto_row_${autoKeyCounter++}`,
        } as FlattenedField);
      }
    } else if (valueHandling === 'flatten' && 'fields' in field) {
      // For other flatten fields (like page), extract children
      if (field.fields) {
        const fieldsArray = Array.isArray(field.fields) ? field.fields : Object.values(field.fields);
        const flattenedChildren = flattenFieldsForRendering(fieldsArray as FieldDef<unknown>[], registry);
        result.push(...flattenedChildren);
      }
    } else if (isGroupField(field)) {
      // Groups maintain their structure
      const childFieldsArray = Object.values(field.fields) as FieldDef<unknown>[];
      const flattenedChildren = flattenFieldsForRendering(childFieldsArray, registry);

      result.push({
        ...field,
        fields: flattenedChildren,
        key: field.key || `auto_group_${autoKeyCounter++}`,
      } as FlattenedField);
    } else if (isArrayField(field)) {
      // Arrays maintain their structure
      const childFieldsArray = Object.values(field.fields) as FieldDef<unknown>[];
      const flattenedChildren = flattenFieldsForRendering(childFieldsArray, registry);

      result.push({
        ...field,
        fields: flattenedChildren,
        key: field.key || `auto_array_${autoKeyCounter++}`,
      } as FlattenedField);
    } else {
      // All other fields maintain their structure
      const key = field.key || `auto_field_${autoKeyCounter++}`;
      result.push({
        ...field,
        key,
      } as FlattenedField);
    }
  }

  return result;
}
