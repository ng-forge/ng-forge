import { FieldPath, Schema, schema } from '@angular/forms/signals';
import { FieldDef } from '../definitions';
import { mapFieldToForm } from './form-mapping';
import { isPageField } from '../definitions/default/page-field';

/**
 * Creates an Angular signal forms schema from field definitions
 * This is the single entry point at dynamic form level that replaces createSchemaFromFields
 * Uses the new modular signal forms adapter structure
 */
export function createSchemaFromFields<TModel = unknown>(fields: readonly FieldDef<Record<string, unknown>>[]): Schema<TModel> {
  return schema<TModel>((path) => {
    for (const fieldDef of fields) {
      // Special handling for page fields - they don't create form controls themselves
      // Instead, their children are processed directly
      if (isPageField(fieldDef)) {
        if (fieldDef.fields) {
          for (const childField of fieldDef.fields) {
            if (!childField.key) continue;

            const childPath = path[childField.key as keyof typeof path] as FieldPath<unknown>;
            if (childPath) {
              mapFieldToForm(childField, childPath);
            }
          }
        }
        continue;
      }

      // Regular field processing
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
export function fieldsToDefaultValues<TModel = unknown>(fields: readonly FieldDef<Record<string, unknown>>[]): TModel {
  const defaultValues: Record<string, unknown> = {};

  for (const field of fields) {
    // Special handling for page fields - flatten their children
    if (isPageField(field)) {
      if (field.fields) {
        for (const childField of field.fields) {
          if ('defaultValue' in childField && childField.defaultValue !== undefined) {
            defaultValues[childField.key] = childField.defaultValue;
          }
        }
      }
      continue;
    }

    // Check if field has a defaultValue property
    if ('defaultValue' in field && field.defaultValue !== undefined) {
      defaultValues[field.key] = field.defaultValue;
    }
  }

  return defaultValues as TModel;
}
