import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition, getFieldValueHandling } from '../../models/field-type';

/**
 * Generates appropriate default values for different field types in dynamic forms.
 *
 * Uses registry configuration to determine how each field type should handle values.
 * Supports exclude/flatten/include modes based on field type registration.
 *
 * @param field - Field definition to generate default value for
 * @param registry - Field type registry for value handling configuration
 * @returns Appropriate default value based on field type and configuration
 *
 * @example
 * ```typescript
 * // Basic input field defaults to empty string
 * getFieldDefaultValue({ type: 'input', key: 'email' }, registry); // ''
 *
 * // Excluded fields (like text/row) return undefined
 * getFieldDefaultValue({ type: 'text', key: 'label' }, registry); // undefined
 *
 * // Group field returns object with child defaults
 * getFieldDefaultValue({
 *   type: 'group',
 *   key: 'address',
 *   fields: [
 *     { type: 'input', key: 'street' },
 *     { type: 'input', key: 'city', value: 'New York' }
 *   ]
 * }, registry); // { street: '', city: 'New York' }
 * ```
 */
export function getFieldDefaultValue(field: FieldDef<unknown>, registry: Map<string, FieldTypeDefinition>): unknown {
  const valueHandling = getFieldValueHandling(field.type, registry);

  // Fields with 'exclude' handling don't contribute values
  if (valueHandling === 'exclude') {
    return undefined;
  }

  // Flatten fields (row/page) return flattened object of children's values
  // This is used by array fields to get the template structure
  // Note: fieldsToDefaultValues will skip these at top-level since they have keys and return objects
  if (valueHandling === 'flatten' && 'fields' in field && field.fields) {
    const childFields = field.fields as readonly FieldDef<unknown>[];

    // Collect only fields that contribute values (exclude buttons, text, etc.)
    const flattenedValues: Record<string, unknown> = {};
    for (const childField of childFields) {
      if ('key' in childField && childField.key) {
        const childValue = getFieldDefaultValue(childField, registry);
        if (childValue !== undefined) {
          flattenedValues[childField.key] = childValue;
        }
      }
    }

    // Return flattened object if there are any values, otherwise undefined
    return Object.keys(flattenedValues).length > 0 ? flattenedValues : undefined;
  }

  // Group fields with 'include' handling create nested objects
  if (field.type === 'group' && 'fields' in field) {
    const fields = field.fields as readonly FieldDef<unknown>[];
    if (!fields || fields.length === 0) {
      return undefined;
    }

    const groupDefaults: Record<string, unknown> = {};
    for (const childField of fields) {
      const childValueHandling = getFieldValueHandling(childField.type, registry);

      // Flatten row/page fields into the group (they are presentational containers)
      if (childValueHandling === 'flatten' && 'fields' in childField && childField.fields) {
        const nestedFields = childField.fields as readonly FieldDef<unknown>[];
        for (const nestedField of nestedFields) {
          if ('key' in nestedField && nestedField.key) {
            const nestedValue = getFieldDefaultValue(nestedField, registry);
            if (nestedValue !== undefined) {
              groupDefaults[nestedField.key] = nestedValue;
            }
          }
        }
      } else if ('key' in childField && childField.key) {
        const childValue = getFieldDefaultValue(childField, registry);
        if (childValue !== undefined) {
          groupDefaults[childField.key] = childValue;
        }
      }
    }
    return groupDefaults;
  }

  // Use explicit value if provided, with type-specific handling for null
  if ('value' in field) {
    // If value is explicitly set (even to null/undefined), respect it
    if (field.value !== null && field.value !== undefined) {
      return field.value;
    }

    // Handle explicit null: use type-specific default
    if (field.value === null) {
      return field.type === 'checkbox' ? false : '';
    }

    // Handle explicit undefined: fall through to type-specific defaults
  }

  // Type-specific defaults when no value is specified
  if (field.type === 'checkbox') {
    return false;
  }

  if (field.type === 'array') {
    // Array field supports two item formats:
    // - Primitive items: single FieldDef (not wrapped in array) → extracts field value directly
    // - Object items: FieldDef[] (array of fields) → merges fields into object
    const arrayField = field as { fields?: readonly (FieldDef<unknown> | readonly FieldDef<unknown>[])[] };
    const itemDefinitions = arrayField.fields;

    if (!itemDefinitions || itemDefinitions.length === 0) {
      return [];
    }

    // Process each item definition
    return itemDefinitions.map((itemDef) => {
      // Primitive item: single FieldDef (not wrapped in array)
      // Extract field value directly - key is for internal tracking only
      if (!Array.isArray(itemDef)) {
        return getFieldDefaultValue(itemDef as FieldDef<unknown>, registry);
      }

      // Object item: FieldDef[] - merge fields into object
      const itemFields = itemDef as readonly FieldDef<unknown>[];
      let itemValue: Record<string, unknown> = {};

      for (const templateField of itemFields) {
        const fieldValue = getFieldDefaultValue(templateField, registry);
        const fieldValueHandling = getFieldValueHandling(templateField.type, registry);

        if (templateField.type === 'group' && 'key' in templateField && templateField.key) {
          // Groups wrap their value under the group key
          itemValue[templateField.key] = fieldValue;
        } else if (templateField.type === 'row') {
          // Rows flatten their fields directly
          if (fieldValue && typeof fieldValue === 'object') {
            itemValue = { ...itemValue, ...(fieldValue as Record<string, unknown>) };
          }
        } else if (fieldValueHandling === 'include' && 'key' in templateField && templateField.key) {
          itemValue[templateField.key] = fieldValue;
        }
      }

      return itemValue;
    });
  }

  // Number inputs need a number type default for Angular signal forms
  // to use valueAsNumber for coercion. NaN is ideal because:
  // - typeof NaN === 'number' (triggers Angular's valueAsNumber path)
  // - NaN displays as empty in number inputs
  // - valueAsNumber returns NaN when input is cleared
  if (field.type === 'input' && 'props' in field) {
    const props = field.props as { type?: string } | undefined;
    if (props?.type === 'number') {
      return NaN;
    }
  }

  return '';
}
