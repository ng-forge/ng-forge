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
 *     { type: 'input', key: 'city', defaultValue: 'New York' }
 *   ]
 * }, registry); // { street: '', city: 'New York' }
 * ```
 */
export function getFieldDefaultValue(field: FieldDef<any>, registry: Map<string, FieldTypeDefinition>): unknown {
  const valueHandling = getFieldValueHandling(field.type, registry);

  // Fields with 'exclude' or 'flatten' handling don't contribute direct values
  if (valueHandling === 'exclude') {
    return undefined;
  }

  if (valueHandling === 'flatten' && 'fields' in field) {
    // Flatten fields don't contribute values themselves - their children are processed separately
    return undefined;
  }

  // Group fields with 'include' handling create nested objects
  if (field.type === 'group' && 'fields' in field) {
    const fields = field.fields as readonly FieldDef<any>[];
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

  // Use explicit defaultValue if provided, with type-specific handling for null
  if ('defaultValue' in field) {
    // If defaultValue is explicitly set (even to null/undefined), respect it
    if (field.defaultValue !== null && field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    // Handle explicit null: use type-specific default
    if (field.defaultValue === null) {
      return field.type === 'checkbox' ? false : '';
    }

    // Handle explicit undefined: fall through to type-specific defaults
  }

  // Type-specific defaults when no defaultValue is specified
  if (field.type === 'checkbox') {
    return false;
  }

  return '';
}
