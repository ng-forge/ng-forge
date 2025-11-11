import { disabled, email, FieldPath, max, maxLength, min, minLength, pattern, required } from '@angular/forms/signals';
import { FieldDef, FieldWithValidation } from '../definitions';
import { applyValidator } from './validation';
import { applyLogic } from './logic';
import { applySchema } from './schema-application';
import { isGroupField } from '../definitions/default/group-field';
import { isArrayField } from '../definitions/default/array-field';
import { isPageField } from '../definitions/default/page-field';
import { isRowField } from '../definitions/default/row-field';

/**
 * Single entry point to map field data into form
 * This is the main function that should be called from the dynamic form component
 */
export function mapFieldToForm<TValue>(fieldDef: FieldDef<any>, fieldPath: FieldPath<TValue>): void {
  // Cast to FieldWithValidation to access validation properties
  const validationField = fieldDef as FieldDef<any> & FieldWithValidation;

  // Special handling for page fields - flatten child fields to root level
  if (isPageField(fieldDef)) {
    mapPageFieldToForm(fieldDef, fieldPath);
    return;
  }

  // Special handling for row fields - flatten child fields to root level (like pages)
  if (isRowField(fieldDef)) {
    mapRowFieldToForm(fieldDef, fieldPath);
    return;
  }

  // Special handling for group fields - apply child field validations to the parent form schema
  if (isGroupField(fieldDef)) {
    mapGroupFieldToForm(fieldDef, fieldPath);
    return;
  }

  // Special handling for array fields - apply child field validations to the parent form schema
  if (isArrayField(fieldDef)) {
    mapArrayFieldToForm(fieldDef, fieldPath);
    return;
  }

  // Apply simple validation rules from field properties (backward compatibility)
  applySimpleValidationRules(validationField, fieldPath);

  // Apply advanced validators if they exist
  if (validationField.validators) {
    validationField.validators.forEach((validatorConfig) => {
      applyValidator(validatorConfig, fieldPath);
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
function applySimpleValidationRules<TValue>(fieldDef: FieldDef<any> & FieldWithValidation, fieldPath: FieldPath<TValue>): void {
  if (fieldDef.required) {
    required(fieldPath);
  }

  if (fieldDef.email) {
    email(fieldPath as FieldPath<string>);
  }

  // Check for min in top-level field or props (for components like slider)
  const minValue = fieldDef.min !== undefined ? fieldDef.min : (fieldDef.props as any)?.min;
  if (minValue !== undefined) {
    min(fieldPath as FieldPath<number>, minValue);
  }

  // Check for max in top-level field or props (for components like slider)
  const maxValue = fieldDef.max !== undefined ? fieldDef.max : (fieldDef.props as any)?.max;
  if (maxValue !== undefined) {
    max(fieldPath as FieldPath<number>, maxValue);
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
function mapFieldSpecificConfiguration<TValue>(fieldDef: FieldDef<any>, fieldPath: FieldPath<TValue>): void {
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
 * Maps page field children to the root form schema
 * Page fields are layout containers that don't create their own form controls
 * Their children are flattened to the root level of the form
 */
function mapPageFieldToForm<TValue>(pageField: FieldDef<any>, rootPath: FieldPath<TValue>): void {
  if (!isPageField(pageField) || !pageField.fields) {
    return;
  }

  // Page fields don't create their own form controls
  // Instead, their child fields are mapped directly to the root form
  // Type assertion: After isPageField guard, we know fields contains FieldDef instances
  const fields = pageField.fields as FieldDef<any>[];
  for (const childField of fields) {
    if (!childField.key) {
      continue;
    }

    // Get the field path for this child at the root level (not nested under the page)
    const childPath = (rootPath as any)[childField.key];
    if (childPath) {
      // Recursively apply field mapping to the child field at root level
      mapFieldToForm(childField, childPath);
    }
  }
}

/**
 * Maps row field children to the root form schema
 * Row fields are layout containers (horizontal) that don't create their own form controls
 * Their children are flattened to the root level of the form, similar to page fields
 */
function mapRowFieldToForm<TValue>(rowField: FieldDef<any>, rootPath: FieldPath<TValue>): void {
  if (!isRowField(rowField) || !rowField.fields) {
    return;
  }

  // Row fields don't create their own form controls
  // Instead, their child fields are mapped directly to the root form
  // Type assertion: After isRowField guard, we know fields contains FieldDef instances
  const fields = rowField.fields as FieldDef<any>[];
  for (const childField of fields) {
    if (!childField.key) {
      continue;
    }

    // Get the field path for this child at the root level (not nested under the row)
    const childPath = (rootPath as any)[childField.key];
    if (childPath) {
      // Recursively apply field mapping to the child field at root level
      mapFieldToForm(childField, childPath);
    }
  }
}

/**
 * Maps group field children to the parent form schema
 * This ensures that validation from child fields is applied to the parent form
 */
function mapGroupFieldToForm<TValue>(groupField: FieldDef<any>, fieldPath: FieldPath<TValue>): void {
  if (!isGroupField(groupField) || !groupField.fields) {
    return;
  }

  // Apply validation for each child field to the appropriate nested path in the parent form
  // Type assertion: After isGroupField guard, we know fields contains FieldDef instances
  const fields = groupField.fields as FieldDef<any>[];
  for (const childField of fields) {
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

/**
 * Maps array field to the parent form schema
 *
 * Array fields are fundamentally different from groups:
 * - The fields array is a TEMPLATE (single field definition), not instances
 * - Array items are created/removed dynamically at runtime
 * - Child field instances handle their own validation when created
 *
 * The array field itself is registered in the parent form via normal
 * field processing (valueHandling: 'include'). Array items are managed
 * by the ArrayFieldComponent which creates dynamic field instances
 * with indexed keys (e.g., 'items[0]', 'items[1]').
 */
function mapArrayFieldToForm<TValue>(arrayField: FieldDef<any>, fieldPath: FieldPath<TValue>): void {
  if (!isArrayField(arrayField) || !arrayField.fields) {
    return;
  }

  // Array fields use a template-based approach where validation is defined
  // in the template and applied to dynamic instances at runtime.
  //
  // Unlike groups or pages (which have static children known at schema creation),
  // array items are dynamic and may not exist yet. The ArrayFieldComponent
  // manages the lifecycle of array items and ensures validation from the
  // template is applied to each dynamically created item.
  //
  // TODO: Support array-level validation (min/max length, unique items, etc.)
  // This would be applied to the array field itself, not individual items:
  //   if (arrayField.minLength) minLength(fieldPath, arrayField.minLength);
  //   if (arrayField.maxLength) maxLength(fieldPath, arrayField.maxLength);
}
