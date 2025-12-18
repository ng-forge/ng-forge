import {
  disabled,
  email,
  hidden,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  readonly,
  required,
  applyEach,
  schema,
} from '@angular/forms/signals';
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

// Type alias for schema path parameters
type AnySchemaPath = SchemaPath<unknown> | SchemaPathTree<unknown>;

// ============================================================================
// Type-safe validator application functions
// ============================================================================

interface StringValidationConfig {
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string | RegExp;
}

interface NumberValidationConfig {
  min?: number;
  max?: number;
}

/**
 * Applies string-specific validators to a schema path.
 * This function is properly typed - no casts needed internally.
 */
function applyStringValidators(path: SchemaPath<string>, config: StringValidationConfig): void {
  if (config.email) {
    email(path);
  }
  if (config.minLength !== undefined) {
    minLength(path, config.minLength);
  }
  if (config.maxLength !== undefined) {
    maxLength(path, config.maxLength);
  }
  if (config.pattern) {
    const regex = typeof config.pattern === 'string' ? new RegExp(config.pattern) : config.pattern;
    pattern(path, regex);
  }
}

/**
 * Applies number-specific validators to a schema path.
 * This function is properly typed - no casts needed internally.
 */
function applyNumberValidators(path: SchemaPath<number>, config: NumberValidationConfig): void {
  if (config.min !== undefined) {
    min(path, config.min);
  }
  if (config.max !== undefined) {
    max(path, config.max);
  }
}

/**
 * Extracts string validation config from a field definition.
 * Returns undefined if no string validators are configured.
 */
function getStringValidationConfig(fieldDef: FieldWithValidation): StringValidationConfig | undefined {
  if (!fieldDef.email && fieldDef.minLength === undefined && fieldDef.maxLength === undefined && !fieldDef.pattern) {
    return undefined;
  }
  return {
    email: fieldDef.email,
    minLength: fieldDef.minLength,
    maxLength: fieldDef.maxLength,
    pattern: fieldDef.pattern,
  };
}

/**
 * Extracts number validation config from a field definition.
 * Handles both 'min'/'max' (standard) and 'minValue'/'maxValue' (SliderField).
 * Returns undefined if no number validators are configured.
 */
function getNumberValidationConfig(fieldDef: FieldWithValidation): NumberValidationConfig | undefined {
  const minVal = fieldDef.min ?? (fieldDef as { minValue?: number }).minValue;
  const maxVal = fieldDef.max ?? (fieldDef as { maxValue?: number }).maxValue;

  if (minVal === undefined && maxVal === undefined) {
    return undefined;
  }
  return { min: minVal, max: maxVal };
}

/**
 * Maps a field definition to the Angular Signal Forms schema.
 *
 * This is the main entry point that should be called from the dynamic form component.
 * It handles all field types: leaf fields, containers (page, row, group), and arrays.
 *
 * Cross-field logic (formValue.*) is handled automatically by createLogicFunction
 * which uses RootFormRegistryService.
 *
 * Cross-field validators are skipped at field level and applied at form level via validateTree.
 */
export function mapFieldToForm(fieldDef: FieldDef<unknown>, fieldPath: AnySchemaPath): void {
  // Layout containers (page, row) - flatten children to current level
  if (isPageField(fieldDef) || isRowField(fieldDef)) {
    mapContainerChildren(fieldDef.fields as FieldDef<unknown>[] | undefined, fieldPath);
    return;
  }

  // Group fields - map children under the group's path
  if (isGroupField(fieldDef)) {
    mapContainerChildren(fieldDef.fields, fieldPath);
    return;
  }

  // Array fields - use applyEach for item schema
  if (isArrayField(fieldDef)) {
    mapArrayFieldToForm(fieldDef, fieldPath);
    return;
  }

  // Leaf field - apply validation, logic, and configuration
  mapLeafField(fieldDef, fieldPath);
}

/**
 * Maps children of a container field (page, row, group) to the form schema.
 */
function mapContainerChildren(fields: readonly FieldDef<unknown>[] | undefined, parentPath: AnySchemaPath): void {
  if (!fields) return;

  const pathRecord = parentPath as Record<string, AnySchemaPath>;

  for (const field of fields) {
    if (!field.key) continue;

    const childPath = pathRecord[field.key];
    if (childPath) {
      mapFieldToForm(field, childPath);
    }
  }
}

/**
 * Maps a leaf field (value-bearing field) to the form schema.
 */
function mapLeafField(fieldDef: FieldDef<unknown>, fieldPath: AnySchemaPath): void {
  const validationField = fieldDef as FieldDef<unknown> & FieldWithValidation;
  const path = fieldPath as SchemaPath<unknown>;

  // Apply simple validation rules from field properties
  applySimpleValidationRules(validationField, path);

  if (validationField.validators) {
    for (const config of validationField.validators) {
      applyValidator(config, fieldPath);
    }
  }

  // Apply logic rules
  if (validationField.logic) {
    for (const config of validationField.logic) {
      applyLogic(config, fieldPath);
    }
  }

  // Apply schemas
  if (validationField.schemas) {
    for (const config of validationField.schemas) {
      applySchema(config, fieldPath);
    }
  }

  // Apply field state configuration
  applyFieldState(fieldDef, path);
}

/**
 * Applies simple validation rules from field properties.
 * Casts are isolated to the boundary between untyped field definitions and typed validator functions.
 */
function applySimpleValidationRules(fieldDef: FieldWithValidation, path: SchemaPath<unknown>): void {
  if (fieldDef.required) {
    required(path);
  }

  // String validators - single cast at boundary
  const stringConfig = getStringValidationConfig(fieldDef);
  if (stringConfig) {
    applyStringValidators(path as SchemaPath<string>, stringConfig);
  }

  // Number validators - single cast at boundary
  const numberConfig = getNumberValidationConfig(fieldDef);
  if (numberConfig) {
    applyNumberValidators(path as SchemaPath<number>, numberConfig);
  }
}

/**
 * Applies field state configuration (disabled, readonly, hidden).
 */
function applyFieldState(fieldDef: FieldDef<unknown>, path: SchemaPath<unknown>): void {
  if (fieldDef.disabled) {
    disabled(path);
  }

  if (fieldDef.readonly) {
    readonly(path);
  }

  if (fieldDef.hidden) {
    hidden(path, () => true);
  }
}

/**
 * Maps an array field to the form schema using applyEach.
 *
 * Array items use a template field definition. applyEach creates proper
 * FieldTree structure for each array item.
 */
function mapArrayFieldToForm(arrayField: FieldDef<unknown>, fieldPath: AnySchemaPath): void {
  if (!isArrayField(arrayField) || !arrayField.fields?.length) {
    return;
  }

  const templateField = arrayField.fields[0];

  const itemSchema = schema<Record<string, unknown>>((itemPath) => {
    const pathRecord = itemPath as Record<string, AnySchemaPath>;

    if (isRowField(templateField) || isPageField(templateField)) {
      // Row/page templates flatten their children
      mapContainerChildren(templateField.fields as FieldDef<unknown>[] | undefined, itemPath);
    } else if (isGroupField(templateField)) {
      // Group template - access group's path first
      const groupKey = templateField.key;
      if (groupKey) {
        const groupPath = pathRecord[groupKey];
        if (groupPath) {
          mapContainerChildren(templateField.fields, groupPath);
        }
      } else {
        // No group key - apply children directly (edge case)
        mapContainerChildren(templateField.fields, itemPath);
      }
    } else {
      // Simple field template
      mapFieldToForm(templateField, itemPath);
    }
  });

  applyEach(fieldPath as SchemaPath<Record<string, unknown>[]>, itemSchema);
}
