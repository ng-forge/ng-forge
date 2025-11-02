import { FieldDef } from '../../definitions/base/field-def';

export function getFieldDefaultValue(field: FieldDef<any>): unknown {
  // Row fields are layout containers and should not have default values
  if (field.type === 'row') {
    return undefined;
  }

  // Group fields should return an object with their child field defaults
  if (field.type === 'group' && 'fields' in field) {
    const fields = field.fields as readonly FieldDef<any>[];
    // If group has no fields, return undefined (exclude from form)
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

  // For null default values, use appropriate type-specific defaults
  if ('defaultValue' in field && field.defaultValue === null) {
    // Checkbox fields should default to false for null default values
    if (field.type === 'checkbox') {
      return false;
    }
    // Input and other string fields should default to empty string for null default values
    return '';
  }

  // Checkbox fields should default to false when no default value is specified
  if (field.type === 'checkbox') {
    return false;
  }

  // For undefined or missing default values, use empty string to ensure field exists in form
  return '';
}
