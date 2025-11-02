import { FieldPath, Schema, schema } from '@angular/forms/signals';
import { FieldDef } from '../definitions';
import { mapFieldToForm } from './form-mapping';

/**
 * Creates an Angular signal forms schema from field definitions
 * This is the single entry point at dynamic form level that replaces createSchemaFromFields
 * Uses the new modular signal forms adapter structure
 */
export function createSchemaFromFields<TModel = unknown>(fields: readonly FieldDef<Record<string, unknown>>[]): Schema<TModel> {
  return schema<TModel>((path) => {
    for (const fieldDef of fields) {
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
    // Check if field has a defaultValue property
    if ('defaultValue' in field && field.defaultValue !== undefined) {
      defaultValues[field.key] = field.defaultValue;
    }
  }

  return defaultValues as TModel;
}
