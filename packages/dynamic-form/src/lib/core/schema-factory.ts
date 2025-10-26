import { max, maxLength, min, minLength, required, schema, Schema } from '@angular/forms/signals';
import { FieldDef, ValidationRules } from '../models/field-config';

/**
 * Creates an Angular signal forms schema from field definitions
 * Following the pattern from the examples
 */
export function createSchemaFromFields<TModel = unknown>(fields: readonly FieldDef[]): Schema<TModel> {
  return schema<TModel>((path) => {
    for (const fieldDef of fields) {
      const fieldPath = (path as any)[fieldDef.key];

      if (!fieldPath) {
        continue;
      }

      // Apply validation rules from field definition
      const rules = buildValidationRulesFromField(fieldDef);
      applyValidationRules(fieldPath, rules);
    }
  });
}


/**
 * Builds validation rules from a field definition
 */
function buildValidationRulesFromField(fieldDef: FieldDef): ValidationRules {
  const rules: ValidationRules = {};

  if (fieldDef.required) rules.required = true;
  if (fieldDef.email) rules.email = true;
  if (fieldDef.min !== undefined) rules.min = fieldDef.min;
  if (fieldDef.max !== undefined) rules.max = fieldDef.max;
  if (fieldDef.minLength !== undefined) rules.minLength = fieldDef.minLength;
  if (fieldDef.maxLength !== undefined) rules.maxLength = fieldDef.maxLength;
  if (fieldDef.patternRule) {
    rules.pattern = typeof fieldDef.patternRule === 'string'
      ? new RegExp(fieldDef.patternRule)
      : fieldDef.patternRule;
  }

  // Merge with explicit validation if provided
  if (fieldDef.validation) {
    Object.assign(rules, fieldDef.validation);
  }

  return rules;
}

/**
 * Applies validation rules to a field path
 */
function applyValidationRules(fieldPath: any, rules: ValidationRules): void {
  if (rules.required) {
    required(fieldPath);
  }

  if (rules.minLength !== undefined) {
    minLength(fieldPath, rules.minLength);
  }

  if (rules.maxLength !== undefined) {
    maxLength(fieldPath, rules.maxLength);
  }

  if (rules.min !== undefined) {
    min(fieldPath, rules.min);
  }

  if (rules.max !== undefined) {
    max(fieldPath, rules.max);
  }

  // Note: pattern and email validation would need custom validators
  // as they're not available in the basic Angular signal forms API
}

/**
 * Utility to convert field definitions to default values object
 */
export function fieldsToDefaultValues<TModel = unknown>(fields: readonly FieldDef[]): TModel {
  const defaultValues: Record<string, any> = {};

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      defaultValues[field.key] = field.defaultValue;
    }
  }

  return defaultValues as TModel;
}
