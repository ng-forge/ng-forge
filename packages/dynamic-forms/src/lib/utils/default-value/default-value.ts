import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { FieldTypeDefinition, getFieldValueHandling } from '@ng-forge/dynamic-forms/internal';

/**
 * Generates appropriate default values for different field types in dynamic forms.
 *
 * @param field - Field definition to generate default value for
 * @param registry - Field type registry for value handling configuration
 * @returns Appropriate default value based on field type and configuration
 */
export function getFieldDefaultValue(field: FieldDef<unknown>, registry: Map<string, FieldTypeDefinition>): unknown {
  const valueHandling = getFieldValueHandling(field.type, registry);

  // Fields with 'exclude' handling don't contribute values
  if (valueHandling === 'exclude') {
    return undefined;
  }

  // Flatten fields (row/page/container) return flattened object of children's values
  // This is used by array fields to get the template structure
  // Note: fieldsToDefaultValues will skip these at top-level since they have keys and return objects
  if (valueHandling === 'flatten' && 'fields' in field && field.fields) {
    const childFields = field.fields as readonly FieldDef<unknown>[];

    // Collect only fields that contribute values (exclude buttons, text, etc.)
    const flattenedValues: Record<string, unknown> = {};
    for (const childField of childFields) {
      const childValueHandling = getFieldValueHandling(childField.type, registry);
      if (childValueHandling === 'exclude') continue;

      const childValue = getFieldDefaultValue(childField, registry);
      if (childValue === undefined) continue;

      if (childValueHandling === 'flatten' && childValue && typeof childValue === 'object' && !Array.isArray(childValue)) {
        // Nested flatten field — its value is already flat; spread it up.
        Object.assign(flattenedValues, childValue as Record<string, unknown>);
      } else if ('key' in childField && childField.key) {
        flattenedValues[childField.key] = childValue;
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
      if (childValueHandling === 'exclude') continue;

      const childValue = getFieldDefaultValue(childField, registry);

      if (childValueHandling === 'flatten') {
        // Flatten container/row/page values into the group (they are presentational containers).
        // The recursive call already returns a flat object — spread it directly.
        if (childValue && typeof childValue === 'object' && !Array.isArray(childValue)) {
          Object.assign(groupDefaults, childValue as Record<string, unknown>);
        }
      } else if ('key' in childField && childField.key) {
        if (childValue !== undefined) {
          groupDefaults[childField.key] = childValue;
        }
      }
    }
    return groupDefaults;
  }

  // Narrow once: `field` is FieldDef<unknown>, but value/nullable are defined on BaseValueField.
  // This cast avoids per-access `as` and documents what we're reading.
  const valueField = field as FieldDef<unknown> & { value?: unknown; nullable?: boolean };
  const isNullable = valueField.nullable === true;

  // Use explicit value if provided (including null when nullable)
  if ('value' in field) {
    if (valueField.value !== null && valueField.value !== undefined) {
      return valueField.value;
    }

    // Preserve explicit null for nullable fields
    if (valueField.value === null && isNullable) {
      return null;
    }

    // Non-nullable null and undefined both fall through to type-specific defaults below
  }

  // Nullable fields with no explicit value default to null
  if (isNullable) {
    return null;
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
        } else if (templateField.type === 'row' || templateField.type === 'container') {
          // Rows and containers flatten their fields directly
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
