import { z, ZodError } from 'zod';

// Import form config schemas
import { MatFormConfigSchema } from '../../../material/src';
import { BsFormConfigSchema } from '../../../bootstrap/src';
import { PrimeFormConfigSchema } from '../../../primeng/src';
import { IonicFormConfigSchema } from '../../../ionic/src';

import type { UiIntegration } from '../json-schema/form-config-json-schema';

/**
 * Map of UI integration to form config schema.
 */
const formConfigSchemas: Record<UiIntegration, z.ZodType> = {
  material: MatFormConfigSchema,
  bootstrap: BsFormConfigSchema,
  primeng: PrimeFormConfigSchema,
  ionic: IonicFormConfigSchema,
};

/**
 * Validation result for form configuration.
 */
export interface ValidationResult {
  /**
   * Whether the configuration is valid.
   */
  valid: boolean;

  /**
   * Parsed configuration if valid, undefined otherwise.
   */
  data?: unknown;

  /**
   * Validation errors if invalid.
   */
  errors?: FormattedValidationError[];

  /**
   * Human-readable error summary.
   */
  errorSummary?: string;
}

/**
 * Formatted validation error for easy consumption.
 */
export interface FormattedValidationError {
  /**
   * Path to the invalid field (e.g., 'fields[0].props.type').
   */
  path: string;

  /**
   * Error message.
   */
  message: string;

  /**
   * Expected value or type.
   */
  expected?: string;

  /**
   * Received value.
   */
  received?: string;
}

/**
 * Known field types for helpful error messages.
 */
const KNOWN_FIELD_TYPES = [
  'input',
  'textarea',
  'select',
  'checkbox',
  'multi-checkbox',
  'radio',
  'datepicker',
  'toggle',
  'slider',
  'hidden',
  'text',
  'row',
  'group',
  'array',
  'page',
  'button',
  'submit',
  'next',
  'previous',
];

/**
 * Properties that commonly cause errors and their correct placement.
 */
const PROPERTY_GUIDANCE: Record<string, string> = {
  options: 'options should be at FIELD level, not inside props',
  minValue: 'minValue should be at FIELD level, not inside props',
  maxValue: 'maxValue should be at FIELD level, not inside props',
  step: 'step should be at FIELD level, not inside props (for slider)',
  fields: 'fields should be at FIELD level, contains child fields for containers',
  template: 'Use "fields" instead of "template" for array items',
  label: 'Container types (row, group, array, page) do NOT have a label property',
  title: 'Page fields do NOT have a title property',
  minItems: 'Array fields do NOT have minItems/maxItems properties',
  maxItems: 'Array fields do NOT have minItems/maxItems properties',
  expressions: 'Use "derivation" or "logic" instead of "expressions"',
  logic:
    'Only PAGE and LEAF fields support logic blocks. Row, group, and array containers do NOT support logic - apply logic to their child fields instead',
};

/**
 * "Did you mean?" suggestions for common typos and wrong property names.
 */
const DID_YOU_MEAN: Record<string, string> = {
  hideWhen: 'Did you mean `logic: [{ type: "hidden", condition: {...} }]`? There is no hideWhen shorthand.',
  showWhen: 'Did you mean `logic: [{ type: "hidden", condition: {...} }]` with inverted condition? There is no showWhen shorthand.',
  disableWhen: 'Did you mean `logic: [{ type: "disabled", condition: {...} }]`? There is no disableWhen shorthand.',
  requiredWhen: 'Did you mean `logic: [{ type: "required", condition: {...} }]`? There is no requiredWhen shorthand.',
  derivation: 'Did you mean `logic: [{ type: "derivation", targetField: "...", expression: "..." }]`? Derivation goes in the logic array.',
  derive: 'Did you mean `logic: [{ type: "derivation", targetField: "...", expression: "..." }]`?',
  computed: 'Did you mean `logic: [{ type: "derivation", targetField: "...", expression: "..." }]`?',
  calculate: 'Did you mean `logic: [{ type: "derivation", targetField: "...", expression: "..." }]`?',
  condition: 'Did you mean to put this inside `logic: [{ type: "...", condition: {...} }]`?',
  visible: 'Did you mean `logic: [{ type: "hidden", condition: {...} }]`? Use hidden with inverted condition for visibility.',
  visibility: 'Did you mean `logic: [{ type: "hidden", condition: {...} }]`?',
  show: 'Did you mean `logic: [{ type: "hidden", condition: {...} }]` with inverted condition?',
  hide: 'Did you mean `logic: [{ type: "hidden", condition: {...} }]`?',
  min: 'Did you mean `minValue` at field level (for slider) or `min` shorthand validator (for numbers)?',
  max: 'Did you mean `maxValue` at field level (for slider) or `max` shorthand validator (for numbers)?',
  items: 'Did you mean `options` for select/radio/multi-checkbox, or `fields` for array containers?',
  template: 'Did you mean `fields`? Arrays use `fields` to define the template for each item.',
  element: 'Did you mean `props: { elementType: "..." }`? For text fields, use elementType inside props.',
  content: 'Did you mean `label`? For text fields, the content goes in the label property.',
  title: 'Did you mean to use a `text` field with `label: "..." and props: { elementType: "h1" }`? Pages don\'t have titles.',
  name: 'Did you mean `key`? Field identifiers use the `key` property.',
  inputType: 'Did you mean `props: { type: "..." }`? Input type goes inside props.',
  fieldType: 'Did you mean `type`? The field type property is just `type`.',
  validators: 'Validators can be shorthand (`required: true`, `email: true`) or use the `validators: [...]` array.',
  validation: 'Did you mean to use validator shorthand (`required`, `email`, `min`, etc.) or `validators: [...]` array?',
};

/**
 * Format a Zod error into user-friendly validation errors.
 */
function formatZodError(error: ZodError, config?: unknown): FormattedValidationError[] {
  const errors = error.errors.map((err) => {
    const path = err.path.join('.') || 'root';
    let message = err.message;
    let expected: string | undefined;
    let received: string | undefined;

    // Extract expected/received if available
    if ('expected' in err) expected = String(err.expected);
    if ('received' in err) received = String(err.received);

    // Enhance "Invalid input" with more context
    if (message === 'Invalid input' || message === 'Invalid union') {
      // Try to figure out what field this is
      const fieldMatch = path.match(/fields\.(\d+)/);
      if (fieldMatch && config && typeof config === 'object' && 'fields' in config) {
        const fields = (config as { fields: unknown[] }).fields;
        const index = parseInt(fieldMatch[1], 10);
        const field = fields[index] as Record<string, unknown> | undefined;

        if (field) {
          const fieldType = field['type'] as string;
          const fieldKey = field['key'] as string;

          if (fieldType && !KNOWN_FIELD_TYPES.includes(fieldType)) {
            message = `Unknown field type "${fieldType}". Valid types: ${KNOWN_FIELD_TYPES.join(', ')}`;
          } else if (fieldType) {
            // Check for common mistakes
            const mistakes: string[] = [];

            // Check for label on containers
            if (['row', 'group', 'array', 'page'].includes(fieldType) && 'label' in field) {
              mistakes.push(`"${fieldType}" fields do NOT have a label property`);
            }

            // Check for options in wrong place
            if (['select', 'radio', 'multi-checkbox'].includes(fieldType)) {
              const props = field['props'] as Record<string, unknown> | undefined;
              if (props && 'options' in props && !('options' in field)) {
                mistakes.push('options should be at field level, not inside props');
              }
              if (!('options' in field) && !(props && 'options' in props)) {
                mistakes.push('options is required for this field type');
              }
            }

            // Check for slider props in wrong place
            if (fieldType === 'slider') {
              const props = field['props'] as Record<string, unknown> | undefined;
              if (props && ('min' in props || 'max' in props || 'step' in props)) {
                mistakes.push('Use minValue/maxValue/step at field level, not min/max/step in props');
              }
            }

            // Check for template instead of fields
            if (['array', 'group', 'row', 'page'].includes(fieldType) && 'template' in field) {
              mistakes.push('Use "fields" instead of "template"');
            }

            // Check for logic on containers that don't support it
            if (['row', 'group', 'array'].includes(fieldType) && 'logic' in field) {
              mistakes.push(`"${fieldType}" containers do NOT support logic blocks - apply logic to individual child fields instead`);
            }

            // Check for "did you mean" properties
            for (const [wrongProp, suggestion] of Object.entries(DID_YOU_MEAN)) {
              if (wrongProp in field) {
                mistakes.push(suggestion);
              }
            }

            if (mistakes.length > 0) {
              message = `Field "${fieldKey || index}" (type: ${fieldType}): ${mistakes.join('; ')}`;
            } else {
              message = `Field "${fieldKey || index}" (type: ${fieldType}) has invalid properties. Check that all properties are valid for this field type.`;
            }
          } else {
            message = `Field at index ${index} is missing required "type" property`;
          }
        }
      }
    }

    // Check if the path matches a known problematic property
    const lastPathPart = err.path[err.path.length - 1];

    // Check for "did you mean" at the path level
    if (typeof lastPathPart === 'string' && DID_YOU_MEAN[lastPathPart]) {
      message = `${message}. ${DID_YOU_MEAN[lastPathPart]}`;
    }
    if (typeof lastPathPart === 'string' && PROPERTY_GUIDANCE[lastPathPart]) {
      message = `${message}. Hint: ${PROPERTY_GUIDANCE[lastPathPart]}`;
    }

    return { path, message, expected, received };
  });

  // Deduplicate errors with same path
  const seen = new Set<string>();
  return errors.filter((err) => {
    const key = `${err.path}:${err.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Generate a human-readable error summary.
 */
function generateErrorSummary(errors: FormattedValidationError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    const err = errors[0];
    return `Validation error at '${err.path}': ${err.message}`;
  }

  const summary = errors.slice(0, 3).map((err) => `  - ${err.path}: ${err.message}`);
  const remaining = errors.length - 3;

  if (remaining > 0) {
    summary.push(`  ... and ${remaining} more error(s)`);
  }

  return `Found ${errors.length} validation errors:\n${summary.join('\n')}`;
}

/**
 * Validate a form configuration against the schema for a UI integration.
 *
 * @param uiIntegration - The UI framework to validate against
 * @param config - The form configuration to validate
 * @returns Validation result with detailed error information
 *
 * @example
 * ```typescript
 * const result = validateFormConfig('material', {
 *   fields: [
 *     { key: 'email', type: 'input', label: 'Email' },
 *   ],
 * });
 *
 * if (result.valid) {
 *   console.log('Valid config:', result.data);
 * } else {
 *   console.error(result.errorSummary);
 * }
 * ```
 */
export function validateFormConfig(uiIntegration: UiIntegration, config: unknown): ValidationResult {
  const schema = formConfigSchemas[uiIntegration];

  if (!schema) {
    return {
      valid: false,
      errors: [
        {
          path: 'uiIntegration',
          message: `Unknown UI integration: ${uiIntegration}. Valid options: material, bootstrap, primeng, ionic`,
        },
      ],
      errorSummary: `Unknown UI integration: ${uiIntegration}`,
    };
  }

  const result = schema.safeParse(config);

  if (result.success) {
    return {
      valid: true,
      data: result.data,
    };
  }

  const errors = formatZodError(result.error, config);

  return {
    valid: false,
    errors,
    errorSummary: generateErrorSummary(errors),
  };
}

/**
 * Type guard for checking if a value is a valid form config for an integration.
 */
export function isValidFormConfig(uiIntegration: UiIntegration, config: unknown): boolean {
  return validateFormConfig(uiIntegration, config).valid;
}
