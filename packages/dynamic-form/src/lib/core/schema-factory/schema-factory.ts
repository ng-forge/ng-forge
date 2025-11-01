import { max, maxLength, min, minLength, required, schema, Schema } from '@angular/forms/signals';
import { ValidationRules } from '../../models/field-config';
import { FieldDef } from '../../definitions';

/**
 * Creates an Angular signal forms schema from field definitions
 * Following the pattern from the examples
 */
export function createSchemaFromFields<TModel = unknown>(fields: readonly FieldDef<Record<string, unknown>>[]): Schema<TModel> {
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
 * TODO: Re-enable when validation properties are added to FieldDef
 */
function buildValidationRulesFromField(fieldDef: FieldDef<Record<string, unknown>>): ValidationRules {
  const rules: ValidationRules = {};
  //
  // // Check for validation in props
  // if (fieldDef.props?.required) rules.required = true;
  // if (fieldDef.props?.email) rules.email = true;
  // if (fieldDef.props?.min !== undefined) rules.min = fieldDef.props.min;
  // if (fieldDef.props?.max !== undefined) rules.max = fieldDef.props.max;
  // if (fieldDef.props?.minLength !== undefined) rules.minLength = fieldDef.props.minLength;
  // if (fieldDef.props?.maxLength !== undefined) rules.maxLength = fieldDef.props.maxLength;
  // if (fieldDef.props?.pattern) {
  //   rules.pattern = typeof fieldDef.props.pattern === 'string' ? new RegExp(fieldDef.props.pattern) : fieldDef.props.pattern;
  // }

  // Also check for direct properties on fieldDef (for backwards compatibility)
  if ((fieldDef as any).required) rules.required = true;
  if ((fieldDef as any).email) rules.email = true;
  if ((fieldDef as any).min !== undefined) rules.min = (fieldDef as any).min;
  if ((fieldDef as any).max !== undefined) rules.max = (fieldDef as any).max;
  if ((fieldDef as any).minLength !== undefined) rules.minLength = (fieldDef as any).minLength;
  if ((fieldDef as any).maxLength !== undefined) rules.maxLength = (fieldDef as any).maxLength;

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
export function fieldsToDefaultValues<TModel = unknown>(fields: readonly FieldDef<Record<string, unknown>>[]): TModel {
  const defaultValues: Record<string, any> = {};

  // TODO: Re-enable when defaultValue property is added to FieldDef
  // for (const field of fields) {
  //   if (field.defaultValue !== undefined) {
  //     defaultValues[field.key] = field.defaultValue;
  //   }
  // }

  return defaultValues as TModel;
}
