import { FieldPath, Schema, schema } from '@angular/forms/signals';
import { FieldDef } from '../definitions';
import { mapFieldToForm } from './form-mapping';
import { FieldTypeDefinition, getFieldValueHandling } from '../models/field-type';
import { getFieldDefaultValue } from '../utils/default-value/default-value';

/**
 * Creates an Angular signal forms schema from field definitions
 * This is the single entry point at dynamic form level that replaces createSchemaFromFields
 * Uses the new modular signal forms adapter structure
 */
export function createSchemaFromFields<TModel = unknown>(
  fields: readonly FieldDef<Record<string, unknown>>[],
  registry: Map<string, FieldTypeDefinition>
): Schema<TModel> {
  return schema<TModel>((path) => {
    for (const fieldDef of fields) {
      const valueHandling = getFieldValueHandling(fieldDef.type, registry);

      // Handle different value handling modes
      if (valueHandling === 'exclude') {
        // Skip fields that don't contribute to form values
        continue;
      }

      if (valueHandling === 'flatten' && 'fields' in fieldDef) {
        // Flatten children to current level
        if (fieldDef.fields) {
          // Handle both array (page/row fields) and object (group fields)
          const fieldsArray = Array.isArray(fieldDef.fields) ? fieldDef.fields : Object.values(fieldDef.fields);
          for (const childField of fieldsArray) {
            if (!childField.key) continue;

            const childPath = path[childField.key as keyof typeof path] as FieldPath<unknown>;
            if (childPath) {
              mapFieldToForm(childField, childPath);
            }
          }
        }
        continue;
      }

      // Regular field processing for 'include' fields
      const fieldPath = path[fieldDef.key as keyof typeof path] as FieldPath<unknown>;

      if (!fieldPath) {
        continue;
      }

      // Use the new modular form mapping function
      // This will progressively apply validators, logic, and schemas
      mapFieldToForm(fieldDef, fieldPath);
    }
  });
}

/**
 * Utility to convert field definitions to default values object
 */
export function fieldsToDefaultValues<TModel = unknown>(
  fields: readonly FieldDef<Record<string, unknown>>[],
  registry: Map<string, FieldTypeDefinition>
): TModel {
  const defaultValues: Record<string, unknown> = {};

  for (const field of fields) {
    if (!field.key) continue;

    const defaultValue = getFieldDefaultValue(field, registry);
    if (defaultValue !== undefined) {
      defaultValues[field.key] = defaultValue;
    }
  }

  return defaultValues as TModel;
}
