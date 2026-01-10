/**
 * Validate Form Config Tool
 *
 * Validates a FormConfig against the ng-forge schema.
 * Returns errors, warnings, and suggestions for improvement.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFieldTypes, getValidators } from '../registry/index.js';

interface ValidationIssue {
  path: string;
  type: 'error' | 'warning';
  message: string;
}

interface FieldConfig {
  key?: string;
  type?: string;
  label?: string;
  required?: boolean;
  email?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: unknown[];
  fields?: FieldConfig[];
  template?: FieldConfig[];
  props?: Record<string, unknown>;
  validators?: unknown[];
  expressions?: Record<string, string>;
  [key: string]: unknown;
}

interface FormConfig {
  fields?: FieldConfig[];
  [key: string]: unknown;
}

const VALID_FIELD_TYPES = new Set<string>();
const VALID_VALIDATOR_TYPES = new Set<string>();

function initializeValidTypes(): void {
  if (VALID_FIELD_TYPES.size === 0) {
    getFieldTypes().forEach((ft) => VALID_FIELD_TYPES.add(ft.type));
  }
  if (VALID_VALIDATOR_TYPES.size === 0) {
    getValidators().forEach((v) => VALID_VALIDATOR_TYPES.add(v.type));
  }
}

function validateField(field: FieldConfig, path: string, issues: ValidationIssue[]): void {
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
  } else if (!VALID_FIELD_TYPES.has(field.type)) {
    issues.push({
      path,
      type: 'error',
      message: `Unknown field type "${field.type}". Valid types: ${[...VALID_FIELD_TYPES].join(', ')}`,
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
        if (v.type && !VALID_VALIDATOR_TYPES.has(v.type)) {
          issues.push({
            path: `${path}.validators[${i}]`,
            type: 'error',
            message: `Unknown validator type "${v.type}". Valid types: ${[...VALID_VALIDATOR_TYPES].join(', ')}`,
          });
        }
      }
    });
  }
}

function validateFormConfig(config: FormConfig): ValidationIssue[] {
  initializeValidTypes();
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
      if (field.template) {
        // Template keys are allowed to repeat across array items
      }
    });
  };
  findDuplicateKeys(config.fields, 'config.fields');

  // Validate each field
  config.fields.forEach((field, i) => {
    validateField(field, `config.fields[${i}]`, issues);
  });

  return issues;
}

export function registerValidateFormConfigTool(server: McpServer): void {
  server.tool(
    'validate_form_config',
    'Validates a FormConfig object and reports errors, warnings, and suggestions',
    {
      config: z.object({}).passthrough().describe('The FormConfig object to validate'),
    },
    async ({ config }) => {
      const issues = validateFormConfig(config as FormConfig);

      const errors = issues.filter((i) => i.type === 'error');
      const warnings = issues.filter((i) => i.type === 'warning');

      const isValid = errors.length === 0;

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
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
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
