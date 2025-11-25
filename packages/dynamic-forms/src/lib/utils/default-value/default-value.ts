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

  // Flatten fields (row/page) when used as array templates need special handling
  if (valueHandling === 'flatten' && 'fields' in field && field.fields) {
    const childFields = field.fields as readonly FieldDef<unknown>[];

    // Collect only fields that contribute values (exclude buttons, text, etc.)
    const valueFields: Array<{ key: string; value: unknown }> = [];
    for (const childField of childFields) {
      if ('key' in childField && childField.key) {
        const childValue = getFieldDefaultValue(childField, registry);
        if (childValue !== undefined) {
          valueFields.push({ key: childField.key, value: childValue });
        }
      }
    }

    // For a single value field with a primitive value, return it directly (flattened)
    // This matches how simple array values are structured: ['value1', 'value2']
    // For complex values (objects/arrays), preserve the key to maintain structure
    if (valueFields.length === 1) {
      const singleValue = valueFields[0].value;
      const isPrimitive = singleValue === null || typeof singleValue !== 'object';
      if (isPrimitive) {
        return singleValue;
      }
      // Complex value (group, nested object) - preserve the key
      return { [valueFields[0].key]: singleValue };
    }

    // For multiple value fields, create object structure
    if (valueFields.length > 1) {
      const defaults: Record<string, unknown> = {};
      for (const valueField of valueFields) {
        defaults[valueField.key] = valueField.value;
      }
      return defaults;
    }

    // No value fields found: return undefined (flatten fields used standalone don't contribute values)
    return undefined;
  }

  // Group fields with 'include' handling create nested objects
  if (field.type === 'group' && 'fields' in field) {
    const fields = field.fields as readonly FieldDef<unknown>[];
    if (!fields || fields.length === 0) {
      return undefined;
    }

    const groupDefaults: Record<string, unknown> = {};
    for (const childField of fields) {
      if ('key' in childField && childField.key) {
        const childValue = getFieldDefaultValue(childField, registry);
        if (childValue !== undefined) {
          groupDefaults[childField.key] = childValue;
        }
      }
    }
    return groupDefaults;
  }

  // Check for defaultValue first (used for reset/clear operations)
  if ('defaultValue' in field && (field as any).defaultValue !== undefined && (field as any).defaultValue !== null) {
    return (field as any).defaultValue;
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
    return [];
  }

  return '';
}
