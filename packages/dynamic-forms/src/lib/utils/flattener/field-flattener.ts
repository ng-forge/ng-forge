import { FieldDef } from '../../definitions/base/field-def';
import { isRowField } from '../../definitions/default/row-field';
import { isGroupField } from '../../definitions/default/group-field';
import { isArrayField } from '../../definitions/default/array-field';
import { FieldTypeDefinition, getFieldValueHandling } from '../../models/field-type';
import { normalizeFieldsArray } from '../object-utils';

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
 * - **Row fields**: Children are flattened and merged into the result (no wrapper), unless preserveRows=true
 * - **Group fields**: Maintains group structure with flattened children nested under the group key
 * - **Array fields**: Maintains array structure with flattened children nested under the array key
 * - **Other fields**: Pass through unchanged with guaranteed key generation
 *
 * Auto-generates keys for fields missing the key property to ensure form binding works correctly.
 *
 * @param fields - Array of field definitions that may contain nested structures
 * @param registry - Field type registry for determining value handling behavior
 * @param options - Configuration options for flattening behavior
 * @param options.preserveRows - When true, keep row fields in structure for DOM rendering (grid layout)
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
 * const flattened = flattenFields(hierarchicalFields, registry);
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
 * const flattened = flattenFields(fieldsWithoutKeys, registry);
 * // Result: [
 * //   { type: 'input', label: 'Name', key: 'auto_field_0' },
 * //   { type: 'button', label: 'Submit', key: 'auto_field_1' }
 * // ]
 * ```
 *
 * @public
 */
export function flattenFields(
  fields: FieldDef<unknown>[],
  registry: Map<string, FieldTypeDefinition>,
  options: { preserveRows?: boolean } = {},
): FlattenedField[] {
  const result: FlattenedField[] = [];
  let autoKeyCounter = 0;

  // Process each field using appropriate strategy based on field type and configuration
  for (const field of fields) {
    // Step 1: Determine how this field type should handle its value in the form
    // valueHandling can be: 'include', 'exclude', or 'flatten'
    const valueHandling = getFieldValueHandling(field.type, registry);

    // Step 2: Check if this is a row field that should be preserved for DOM rendering
    // Row fields need to render their container element for grid layouts to work
    if (options.preserveRows && isRowField(field)) {
      if (field.fields) {
        // Recursively flatten children while preserving row structure
        const flattenedChildren = flattenFields(normalizeFieldsArray(field.fields) as FieldDef<unknown>[], registry, options);

        // Keep the row field in the result with its flattened children
        // This allows the row component to render its container while children are flattened
        result.push({
          ...field,
          fields: flattenedChildren,
          key: field.key || `auto_row_${autoKeyCounter++}`,
        } as FlattenedField);
      }
    } else if (valueHandling === 'flatten' && 'fields' in field) {
      // Step 3: Handle fields with 'flatten' value handling (typically page/row fields)
      // These fields are pure containers - merge their children directly into the parent level
      if (field.fields) {
        const fields = field.fields as FieldDef<unknown>[] | Record<string, FieldDef<unknown>>;
        const flattenedChildren = flattenFields(normalizeFieldsArray(fields), registry, options);

        // Spread children directly into result - the container field itself is discarded
        // This is used for page fields (form structure) and row fields (form values)
        result.push(...flattenedChildren);
      }
    } else if (isGroupField(field)) {
      // Step 4: Handle group fields - preserve structure for nested form values
      // Group fields create a nested object in the form value: { groupKey: { field1: value1, ... } }
      const childFieldsArray = Object.values(field.fields) as FieldDef<unknown>[];
      const flattenedChildren = flattenFields(childFieldsArray, registry, options);

      // Keep the group field with its recursively flattened children nested under its key
      result.push({
        ...field,
        fields: flattenedChildren,
        key: field.key || `auto_group_${autoKeyCounter++}`,
      } as FlattenedField);
    } else if (isArrayField(field)) {
      // Step 5: Handle array fields - preserve structure for array form values
      // Array fields create an array in the form value: { arrayKey: [item1, item2, ...] }
      // New structure: fields is FieldDef[][] (array of item templates)
      const itemTemplates = field.fields as readonly (readonly FieldDef<unknown>[])[];

      // Flatten each item template's fields
      const flattenedItemTemplates = itemTemplates.map((itemFields) => flattenFields([...itemFields], registry, options));

      // Keep the array field with its flattened item templates nested under its key
      result.push({
        ...field,
        fields: flattenedItemTemplates,
        key: field.key || `auto_array_${autoKeyCounter++}`,
      } as FlattenedField);
    } else {
      // Step 6: Handle all other fields (inputs, buttons, etc.) - pass through unchanged
      // These fields are leaf nodes that don't contain children and map directly to form controls
      const key = field.key || `auto_field_${autoKeyCounter++}`;
      result.push({
        ...field,
        key,
      } as FlattenedField);
    }
  }

  return result;
}
