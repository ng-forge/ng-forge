import { disabled, email, max, maxLength, min, minLength, pattern, required, SchemaPathRules, PathKind } from '@angular/forms/signals';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { FieldDef } from '../definitions/base/field-def';
import { FieldWithValidation } from '../definitions/base/field-with-validation';
import { applyValidator } from './validation/validator-factory';
import { applyLogic } from './logic/logic-applicator';
import { applySchema } from './schema-application';
import { isGroupField } from '../definitions/default/group-field';
import { isArrayField } from '../definitions/default/array-field';
import { isPageField } from '../definitions/default/page-field';
import { isRowField } from '../definitions/default/row-field';

/**
 * Safely cast a SchemaPathTree to SchemaPath with Supported rules.
 * See validator-factory.ts for detailed explanation of why this is safe.
 */
function toSupportedPath<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, any, TPathKind> | SchemaPathTree<TValue, TPathKind>,
): SchemaPath<TValue, SchemaPathRules.Supported, TPathKind> {
  return path as SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>;
}

/**
 * Single entry point to map field data into form
 * This is the main function that should be called from the dynamic form component
 */
export function mapFieldToForm(fieldDef: FieldDef<any>, fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
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
 *
 * Note: This function accepts SchemaPath<any> because FieldDef doesn't encode
 * the field's TypeScript type at compile time. The validators are applied based
 * on runtime FieldDef properties (email, min, max, etc.). The type assertions
 * to specific types (string, number) are safe because:
 * 1. Angular's validators perform runtime value checks, not compile-time type checks
 * 2. The FieldDef properties indicate which validator to apply
 * 3. The SchemaPath type parameter is primarily for IDE autocomplete/type inference
 */
function applySimpleValidationRules(fieldDef: FieldDef<any> & FieldWithValidation, fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  const path = toSupportedPath(fieldPath);

  // Required validator
  if (fieldDef.required) {
    required(path);
  }

  // Email validator
  if (fieldDef.email) {
    // Email validator expects SchemaPath<string>
    email(path as SchemaPath<string, SchemaPathRules.Supported>);
  }

  // Numeric validators (min/max)
  const minValue = fieldDef.min ?? (fieldDef.props as any)?.min;
  const maxValue = fieldDef.max ?? (fieldDef.props as any)?.max;

  if (minValue !== undefined) {
    // Min validator expects SchemaPath<number>
    min(path as SchemaPath<number, SchemaPathRules.Supported>, minValue);
  }

  if (maxValue !== undefined) {
    // Max validator expects SchemaPath<number>
    max(path as SchemaPath<number, SchemaPathRules.Supported>, maxValue);
  }

  // String length validators
  if (fieldDef.minLength !== undefined) {
    // MinLength validator expects SchemaPath<string>
    minLength(path as SchemaPath<string, SchemaPathRules.Supported>, fieldDef.minLength);
  }

  if (fieldDef.maxLength !== undefined) {
    // MaxLength validator expects SchemaPath<string>
    maxLength(path as SchemaPath<string, SchemaPathRules.Supported>, fieldDef.maxLength);
  }

  // Pattern validator
  if (fieldDef.pattern) {
    const regexPattern = typeof fieldDef.pattern === 'string' ? new RegExp(fieldDef.pattern) : fieldDef.pattern;
    // Pattern validator expects SchemaPath<string>
    pattern(path as SchemaPath<string, SchemaPathRules.Supported>, regexPattern);
  }
}

/**
 * Handle field-specific configuration that doesn't fit into validators/logic/schemas
 */
function mapFieldSpecificConfiguration(fieldDef: FieldDef<any>, fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  // Handle disabled state
  if (fieldDef.disabled) {
    disabled(toSupportedPath(fieldPath));
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
 * Common helper to map child fields to their parent form paths
 * @param fields - Array of child field definitions
 * @param parentPath - The parent field path
 */
function mapChildFieldsToForm<TValue>(fields: FieldDef<any>[], parentPath: SchemaPath<TValue> | SchemaPathTree<TValue>): void {
  for (const childField of fields) {
    if (!childField.key) {
      continue;
    }

    // Type assertion needed due to dynamic field keys
    const childPath = (parentPath as any)[childField.key] as SchemaPath<any> | SchemaPathTree<any> | undefined;
    if (childPath) {
      mapFieldToForm(childField, childPath);
    }
  }
}

/**
 * Maps page field children to the root form schema
 * Page fields are layout containers that don't create their own form controls
 * Their children are flattened to the root level of the form
 */
function mapPageFieldToForm(pageField: FieldDef<any>, rootPath: SchemaPath<any> | SchemaPathTree<any>): void {
  if (!isPageField(pageField) || !pageField.fields) {
    return;
  }

  const fields = pageField.fields as FieldDef<any>[];
  mapChildFieldsToForm(fields, rootPath);
}

/**
 * Maps row field children to the root form schema
 * Row fields are layout containers (horizontal) that don't create their own form controls
 * Their children are flattened to the root level of the form, similar to page fields
 */
function mapRowFieldToForm(rowField: FieldDef<any>, rootPath: SchemaPath<any> | SchemaPathTree<any>): void {
  if (!isRowField(rowField) || !rowField.fields) {
    return;
  }

  const fields = rowField.fields as FieldDef<any>[];
  mapChildFieldsToForm(fields, rootPath);
}

/**
 * Maps group field children to the parent form schema
 * This ensures that validation from child fields is applied to the parent form
 */
function mapGroupFieldToForm(groupField: FieldDef<any>, fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  if (!isGroupField(groupField) || !groupField.fields) {
    return;
  }

  const fields = groupField.fields as FieldDef<any>[];
  mapChildFieldsToForm(fields, fieldPath);
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
function mapArrayFieldToForm(arrayField: FieldDef<any>, fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
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
