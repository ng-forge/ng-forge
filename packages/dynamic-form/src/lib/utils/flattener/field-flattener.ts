import { FieldDef } from '../../definitions';
import { isRowField } from '../../definitions/default/row-field';
import { isGroupField } from '../../definitions/default/group-field';

/**
 * Represents a field definition that has been processed through the flattening algorithm.
 *
 * Guarantees that the field has a valid key property, either from the original
 * field definition or auto-generated during the flattening process.
 *
 * @public
 * @since 1.0.0
 */
export interface FlattenedField extends FieldDef<Record<string, unknown>> {
  /** Guaranteed non-empty key for form binding and field identification */
  readonly key: string;
}

/**
 * Flattens a hierarchical field structure into a linear array for form processing.
 *
 * Handles different field types with specific flattening strategies:
 * - **Row fields**: Children are flattened and merged into the result (no wrapper)
 * - **Group fields**: Maintains group structure with flattened children nested under the group key
 * - **Other fields**: Pass through unchanged with guaranteed key generation
 *
 * Auto-generates keys for fields missing the key property to ensure form binding works correctly.
 *
 * @param fields - Array of field definitions that may contain nested structures
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
 * @since 1.0.0
 */
export function flattenFields(fields: readonly FieldDef<Record<string, unknown>>[]): FlattenedField[] {
  const result: FlattenedField[] = [];
  let autoKeyCounter = 0;

  for (const field of fields) {
    if (isRowField(field)) {
      const flattenedChildren = flattenFields(field.fields);
      result.push(...flattenedChildren);
    } else if (isGroupField(field)) {
      const childFieldsArray = Object.values(field.fields);
      const flattenedChildren = flattenFields(childFieldsArray);

      // Add only the group field with its flattened children, not the children separately
      result.push({
        ...field,
        fields: flattenedChildren,
        key: field.key || `auto_group_${autoKeyCounter++}`,
      } as FlattenedField);
    } else {
      // Ensure the field has a key, auto-generate if missing
      const key = field.key || `auto_field_${autoKeyCounter++}`;
      result.push({
        ...field,
        key,
      } as FlattenedField);
    }
  }

  return result;
}
