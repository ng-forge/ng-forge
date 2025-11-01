import { FieldDef } from '../../definitions/base/field-def';

export function getFieldDefaultValue(field: FieldDef<any>): unknown {
  // Group and row fields are container fields and should not have default values
  if (field.type === 'group' || field.type === 'row') {
    return undefined;
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
