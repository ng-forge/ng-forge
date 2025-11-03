import { FieldDef } from '../../definitions/base/field-def';

/**
 * Generates appropriate default values for different field types in dynamic forms.
 *
 * Handles special cases for layout fields (row/group) and applies type-specific
 * default value logic. Group fields recursively generate default values for their
 * child fields, while layout fields like rows are excluded from form values.
 *
 * @param field - Field definition to generate default value for
 * @returns Appropriate default value based on field type and configuration
 *
 * @example
 * ```typescript
 * // Basic input field defaults to empty string
 * getFieldDefaultValue({ type: 'input', key: 'email' }); // ''
 *
 * // Checkbox field defaults to false
 * getFieldDefaultValue({ type: 'checkbox', key: 'terms' }); // false
 *
 * // Field with explicit default value
 * getFieldDefaultValue({
 *   type: 'input',
 *   key: 'country',
 *   defaultValue: 'US'
 * }); // 'US'
 *
 * // Group field returns object with child defaults
 * getFieldDefaultValue({
 *   type: 'group',
 *   key: 'address',
 *   fields: [
 *     { type: 'input', key: 'street' },
 *     { type: 'input', key: 'city', defaultValue: 'New York' }
 *   ]
 * }); // { street: '', city: 'New York' }
 *
 * // Row fields are layout containers (no default value)
 * getFieldDefaultValue({ type: 'row', fields: [...] }); // undefined
 * ```
 */
export function getFieldDefaultValue(field: FieldDef<any>): unknown {
  if (field.type === 'row') {
    return undefined;
  }

  if (field.type === 'group' && 'fields' in field) {
    const fields = field.fields as readonly FieldDef<any>[];
    if (!fields || fields.length === 0) {
      return undefined;
    }

    const groupDefaults: Record<string, unknown> = {};
    for (const childField of fields) {
      if ('key' in childField && childField.key) {
        groupDefaults[childField.key] = getFieldDefaultValue(childField);
      }
    }
    return groupDefaults;
  }

  if ('defaultValue' in field && field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  if ('defaultValue' in field && field.defaultValue === null) {
    if (field.type === 'checkbox') {
      return false;
    }
    return '';
  }

  if (field.type === 'checkbox') {
    return false;
  }

  return '';
}
