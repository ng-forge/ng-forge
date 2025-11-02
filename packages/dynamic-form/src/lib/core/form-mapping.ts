import { disabled, email, FieldPath, max, maxLength, min, minLength, pattern, required } from '@angular/forms/signals';
import { FieldDef, FieldWithValidation } from '../definitions';
import { createValidator } from './validation';
import { applyLogic } from './logic';
import { applySchema } from './schema-application';
import { isGroupField } from '../definitions/default/group-field';

/**
 * Single entry point to map field data into form
 * This is the main function that should be called from the dynamic form component
 */
export function mapFieldToForm<TValue>(fieldDef: FieldDef<Record<string, unknown>>, fieldPath: FieldPath<TValue>): void {
  // Cast to FieldWithValidation to access validation properties
  const validationField = fieldDef as FieldDef<Record<string, unknown>> & FieldWithValidation;

  // Special handling for group fields - apply child field validations to the parent form schema
  if (isGroupField(fieldDef)) {
    mapGroupFieldToForm(fieldDef, fieldPath);
    return;
  }

  // Apply simple validation rules from field properties (backward compatibility)
  applySimpleValidationRules(validationField, fieldPath);

  // Apply advanced validators if they exist
  if (validationField.validators) {
    validationField.validators.forEach((validatorConfig) => {
      createValidator(validatorConfig, fieldPath);
    });
  }

  // Apply logic if it exists
  if (validationField.logic) {
    validationField.logic.forEach((logicConfig) => {
      applyLogic(logicConfig, fieldPath);
    });
  }

  // Apply schemas if they exist
  if (validationField.schemas) {
    validationField.schemas.forEach((schemaConfig) => {
      applySchema(schemaConfig, fieldPath);
    });
  }

  // Handle any additional field-specific configuration
  mapFieldSpecificConfiguration(fieldDef, fieldPath);
}

/**
 * Apply simple validation rules from field properties for backward compatibility
 */
function applySimpleValidationRules<TValue>(
  fieldDef: FieldDef<Record<string, unknown>> & FieldWithValidation,
  fieldPath: FieldPath<TValue>
): void {
  if (fieldDef.required) {
    required(fieldPath);
  }

  if (fieldDef.email) {
    email(fieldPath as FieldPath<string>);
  }

  if (fieldDef.min !== undefined) {
    min(fieldPath as FieldPath<number>, fieldDef.min);
  }

  if (fieldDef.max !== undefined) {
    max(fieldPath as FieldPath<number>, fieldDef.max);
  }

  if (fieldDef.minLength !== undefined) {
    minLength(fieldPath as FieldPath<string>, fieldDef.minLength);
  }

  if (fieldDef.maxLength !== undefined) {
    maxLength(fieldPath as FieldPath<string>, fieldDef.maxLength);
  }

  if (fieldDef.pattern) {
    const regexPattern = typeof fieldDef.pattern === 'string' ? new RegExp(fieldDef.pattern) : fieldDef.pattern;
    pattern(fieldPath as FieldPath<string>, regexPattern);
  }
}

/**
 * Handle field-specific configuration that doesn't fit into validators/logic/schemas
 */
function mapFieldSpecificConfiguration<TValue>(fieldDef: FieldDef<Record<string, unknown>>, fieldPath: FieldPath<TValue>): void {
  // Handle disabled state
  if (fieldDef.disabled) {
    disabled(fieldPath);
  }

  // Handle any additional configuration specific to the field type
  // This can be extended as needed for specific field requirements

  // Example: if field has custom form integration requirements
  if ('customFormConfig' in fieldDef && fieldDef.customFormConfig) {
    console.log('Custom form configuration detected for field:', fieldDef.key);
    // Handle custom configuration here
  }
}

/**
 * Maps group field children to the parent form schema
 * This ensures that validation from child fields is applied to the parent form
 */
function mapGroupFieldToForm<TValue>(groupField: FieldDef<Record<string, unknown>>, fieldPath: FieldPath<TValue>): void {
  if (!isGroupField(groupField) || !groupField.fields) {
    return;
  }

  // Apply validation for each child field to the appropriate nested path in the parent form
  for (const childField of groupField.fields) {
    if (!childField.key) {
      continue;
    }

    // Get the nested path for this child field within the group
    const nestedPath = (fieldPath as any)[childField.key];
    if (nestedPath) {
      // Recursively apply field mapping to the child field
      mapFieldToForm(childField, nestedPath);
    }
  }
}
