/**
 * Form Config Validation
 *
 * Pure validation functions for ng-forge FormConfig objects.
 * This module has no MCP dependencies and can be used directly
 * in other contexts (e.g., AWS Amplify AI tools).
 */

import { getFieldTypes, getValidators } from '../registry/index.js';
import type { FieldConfig, FormConfig, ValidationIssue, ValidationResult } from './types.js';

// Cached valid types
let validFieldTypes: Set<string> | null = null;
let validValidatorTypes: Set<string> | null = null;

function getValidFieldTypes(): Set<string> {
  if (!validFieldTypes) {
    validFieldTypes = new Set(getFieldTypes().map((ft) => ft.type));
  }
  return validFieldTypes;
}

function getValidValidatorTypes(): Set<string> {
  if (!validValidatorTypes) {
    validValidatorTypes = new Set(getValidators().map((v) => v.type));
  }
  return validValidatorTypes;
}

function validateField(field: FieldConfig, path: string, issues: ValidationIssue[]): void {
  const fieldTypes = getValidFieldTypes();
  const validatorTypes = getValidValidatorTypes();

  // Check for required key
  if (!field.key && field.type !== 'row') {
    issues.push({
      path,
      type: 'error',
      message: 'Field is missing required "key" property',
    });
  }

  // Check for valid type
  if (!field.type) {
    issues.push({
      path,
      type: 'error',
      message: 'Field is missing required "type" property',
    });
  } else if (!fieldTypes.has(field.type)) {
    issues.push({
      path,
      type: 'error',
      message: `Unknown field type "${field.type}". Valid types: ${[...fieldTypes].join(', ')}`,
    });
  }

  // Check for label on value fields
  const valueFieldTypes = ['input', 'textarea', 'select', 'checkbox', 'radio', 'datepicker', 'toggle', 'slider'];
  if (field.type && valueFieldTypes.includes(field.type) && !field.label) {
    issues.push({
      path,
      type: 'warning',
      message: `Field "${field.key}" is missing a label. Labels improve accessibility.`,
    });
  }

  // Check select/radio have options
  if ((field.type === 'select' || field.type === 'radio' || field.type === 'multi-checkbox') && !field.options) {
    // Check if options might be dynamic via expressions
    if (!field.expressions?.['props.options']) {
      issues.push({
        path,
        type: 'error',
        message: `Field "${field.key}" of type "${field.type}" requires "options" array or dynamic "expressions['props.options']"`,
      });
    }
  }

  // Check array fields have template
  if (field.type === 'array' && !field.template) {
    issues.push({
      path,
      type: 'error',
      message: `Array field "${field.key}" requires a "template" property`,
    });
  }

  // Check container fields have fields
  if ((field.type === 'group' || field.type === 'page' || field.type === 'row') && !field.fields) {
    issues.push({
      path,
      type: 'error',
      message: `Container field "${field.key}" of type "${field.type}" requires a "fields" array`,
    });
  }

  // Validate min/max consistency
  if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
    issues.push({
      path,
      type: 'error',
      message: `Field "${field.key}" has min (${field.min}) greater than max (${field.max})`,
    });
  }

  // Validate minLength/maxLength consistency
  if (field.minLength !== undefined && field.maxLength !== undefined && field.minLength > field.maxLength) {
    issues.push({
      path,
      type: 'error',
      message: `Field "${field.key}" has minLength (${field.minLength}) greater than maxLength (${field.maxLength})`,
    });
  }

  // Check pattern is valid regex
  if (field.pattern) {
    try {
      new RegExp(field.pattern);
    } catch {
      issues.push({
        path,
        type: 'error',
        message: `Field "${field.key}" has invalid regex pattern: "${field.pattern}"`,
      });
    }
  }

  // Validate nested fields
  if (field.fields && Array.isArray(field.fields)) {
    field.fields.forEach((child, i) => {
      validateField(child, `${path}.fields[${i}]`, issues);
    });
  }

  // Validate template fields
  if (field.template && Array.isArray(field.template)) {
    field.template.forEach((child, i) => {
      validateField(child, `${path}.template[${i}]`, issues);
    });
  }

  // Validate validators array if present
  if (field.validators && Array.isArray(field.validators)) {
    field.validators.forEach((validator, i) => {
      if (typeof validator === 'object' && validator !== null) {
        const v = validator as { type?: string };
        if (v.type && !validatorTypes.has(v.type)) {
          issues.push({
            path: `${path}.validators[${i}]`,
            type: 'error',
            message: `Unknown validator type "${v.type}". Valid types: ${[...validatorTypes].join(', ')}`,
          });
        }
      }
    });
  }
}

/**
 * Validates a FormConfig and returns all issues found
 *
 * @param config - The FormConfig object to validate
 * @returns Array of validation issues (errors and warnings)
 */
export function validateFormConfigIssues(config: FormConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!config.fields || !Array.isArray(config.fields)) {
    issues.push({
      path: 'config',
      type: 'error',
      message: 'FormConfig must have a "fields" array',
    });
    return issues;
  }

  if (config.fields.length === 0) {
    issues.push({
      path: 'config.fields',
      type: 'warning',
      message: 'FormConfig has empty fields array',
    });
    return issues;
  }

  // Check for duplicate keys
  const keys = new Set<string>();
  const findDuplicateKeys = (fields: FieldConfig[], path: string) => {
    fields.forEach((field, i) => {
      if (field.key) {
        if (keys.has(field.key)) {
          issues.push({
            path: `${path}[${i}]`,
            type: 'error',
            message: `Duplicate field key "${field.key}"`,
          });
        }
        keys.add(field.key);
      }
      if (field.fields) {
        findDuplicateKeys(field.fields, `${path}[${i}].fields`);
      }
      // Template keys are allowed to repeat across array items
    });
  };
  findDuplicateKeys(config.fields, 'config.fields');

  // Validate each field
  config.fields.forEach((field, i) => {
    validateField(field, `config.fields[${i}]`, issues);
  });

  return issues;
}

/**
 * Validates a FormConfig and returns a structured result
 *
 * @param config - The FormConfig object to validate
 * @returns Validation result with errors, warnings, and summary
 *
 * @example
 * ```typescript
 * import { validateFormConfig } from '@ng-forge/dynamic-form-mcp';
 *
 * const result = validateFormConfig({
 *   fields: [
 *     { key: 'email', type: 'input', label: 'Email' }
 *   ]
 * });
 *
 * if (result.valid) {
 *   console.log('Config is valid!');
 * } else {
 *   console.log('Errors:', result.errors);
 * }
 * ```
 */
export function validateFormConfig(config: FormConfig): ValidationResult {
  const issues = validateFormConfigIssues(config);

  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');

  const isValid = errors.length === 0;

  return {
    valid: isValid,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors.map((e) => ({ path: e.path, message: e.message })),
    warnings: warnings.map((w) => ({ path: w.path, message: w.message })),
    summary: isValid
      ? warnings.length > 0
        ? `Config is valid with ${warnings.length} warning(s)`
        : 'Config is valid'
      : `Config has ${errors.length} error(s) and ${warnings.length} warning(s)`,
  };
}
