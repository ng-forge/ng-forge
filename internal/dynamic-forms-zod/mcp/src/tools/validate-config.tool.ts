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
    'Container fields (page, group, row, array) only support the "hidden" logic type. For other logic types (disabled, required, readonly, derivation), apply them to child fields instead',
};

/**
 * "Did you mean?" suggestions for common typos and wrong property names.
 */
const DID_YOU_MEAN: Record<string, string> = {
  hideWhen: 'Did you mean `logic: [{ type: "hidden", condition: {...} }]`? There is no hideWhen shorthand.',
  showWhen: 'Did you mean `logic: [{ type: "hidden", condition: {...} }]` with inverted condition? There is no showWhen shorthand.',
  disableWhen: 'Did you mean `logic: [{ type: "disabled", condition: {...} }]`? There is no disableWhen shorthand.',
  requiredWhen: 'Did you mean `logic: [{ type: "required", condition: {...} }]`? There is no requiredWhen shorthand.',
  derivation:
    'Derivations are defined ON the target field using shorthand (`derivation: "expression"`) or logic array (`logic: [{ type: "derivation", expression: "..." }]`).',
  derive:
    'Did you mean the `derivation` shorthand? Define it ON the target field: `{ key: "total", derivation: "formValue.a + formValue.b" }`',
  computed:
    'Did you mean the `derivation` shorthand? Define it ON the target field: `{ key: "total", derivation: "formValue.a + formValue.b" }`',
  calculate:
    'Did you mean the `derivation` shorthand? Define it ON the target field: `{ key: "total", derivation: "formValue.a + formValue.b" }`',
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

            // Check for non-hidden logic types on containers
            if (['row', 'group', 'array'].includes(fieldType) && 'logic' in field) {
              const logicArr = field['logic'];
              if (Array.isArray(logicArr)) {
                const nonHidden = (logicArr as Array<Record<string, unknown>>).filter(
                  (l) => l && typeof l === 'object' && l['type'] !== 'hidden',
                );
                if (nonHidden.length > 0) {
                  mistakes.push(
                    `"${fieldType}" containers only support 'hidden' logic type - for other logic types, apply to child fields instead`,
                  );
                }
              }
            }

            // Check for hidden field issues
            if (fieldType === 'hidden') {
              if (!('value' in field)) {
                mistakes.push('hidden fields REQUIRE a "value" property - they exist only to pass values through the form');
              }
              const forbidden = ['label', 'logic', 'validators', 'required', 'props', 'disabled', 'readonly'];
              const found = forbidden.filter((p) => p in field);
              if (found.length > 0) {
                mistakes.push(`hidden fields do NOT support: ${found.join(', ')} - they only accept key, type, value, className`);
              }
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
 * Invalid properties that should be rejected even though Zod strips them.
 * These are common mistakes that TypeScript would reject.
 */
const INVALID_VALIDATOR_PROPS = ['message', 'errorMessage', 'msg'];
const INVALID_CONTAINER_PROPS = ['label', 'title', 'description'];

/**
 * Properties that are FORBIDDEN on hidden fields.
 * Hidden fields only support: key, type, value, className
 */
const FORBIDDEN_HIDDEN_PROPS = [
  'label',
  'meta',
  'disabled',
  'readonly',
  'hidden',
  'tabIndex',
  'col',
  'validators',
  'logic',
  'required',
  'props',
  'email',
  'min',
  'max',
  'minLength',
  'maxLength',
  'pattern',
  'placeholder',
];

/**
 * Properties that are FORBIDDEN on container fields (row, group, array).
 * Note: page supports logic (hidden only).
 */
const CONTAINER_FORBIDDEN_PROPS = ['validators', 'required', 'email', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'value'];

/**
 * Field types that require the 'options' property.
 */
const FIELDS_REQUIRING_OPTIONS = ['select', 'radio', 'multi-checkbox'];

/**
 * Nesting rules - what can contain what.
 */
const NESTING_RULES: Record<string, { allowed: string[]; forbidden: string[]; message: string }> = {
  page: {
    allowed: [
      'row',
      'group',
      'array',
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
      'button',
      'submit',
      'next',
      'previous',
      'addArrayItem',
      'removeArrayItem',
    ],
    forbidden: ['page'],
    message: 'Pages cannot be nested inside other containers. ALL top-level fields must be pages if using multi-page mode.',
  },
  row: {
    allowed: [
      'group',
      'array',
      'input',
      'textarea',
      'select',
      'checkbox',
      'multi-checkbox',
      'radio',
      'datepicker',
      'toggle',
      'slider',
      'text',
      'button',
      'submit',
      'next',
      'previous',
      'addArrayItem',
      'removeArrayItem',
    ],
    forbidden: ['page', 'row', 'hidden'],
    message: 'Rows cannot contain pages, other rows, or hidden fields. Hidden fields should be at page or form level.',
  },
  group: {
    allowed: [
      'row',
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
      'button',
      'submit',
      'next',
      'previous',
      'addArrayItem',
      'removeArrayItem',
    ],
    forbidden: ['page', 'group'],
    message: 'Groups cannot contain pages or other groups (no nested groups).',
  },
  array: {
    allowed: [
      'row',
      'group',
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
      'button',
      'submit',
      'next',
      'previous',
      'addArrayItem',
      'removeArrayItem',
    ],
    forbidden: ['page', 'array'],
    message: 'Arrays cannot contain pages or other arrays (no nested arrays).',
  },
};

/**
 * Expected structure examples for common field types.
 */
const EXPECTED_STRUCTURE: Record<string, string> = {
  hidden: `{ key: 'fieldKey', type: 'hidden', value: 'yourValue' }`,
  select: `{ key: 'fieldKey', type: 'select', label: 'Label', options: [{ label: 'Option', value: 'value' }] }`,
  radio: `{ key: 'fieldKey', type: 'radio', label: 'Label', options: [{ label: 'Option', value: 'value' }] }`,
  'multi-checkbox': `{ key: 'fieldKey', type: 'multi-checkbox', label: 'Label', options: [{ label: 'Option', value: 'value' }] }`,
  slider: `{ key: 'fieldKey', type: 'slider', label: 'Label', minValue: 0, maxValue: 100, step: 1 }`,
  row: `{ key: 'rowKey', type: 'row', fields: [...childFields] }`,
  group: `{ key: 'groupKey', type: 'group', fields: [...childFields] }`,
  array: `{ key: 'arrayKey', type: 'array', fields: [...templateFields] }`,
  page: `{ key: 'pageKey', type: 'page', fields: [...childFields, { key: 'next', type: 'next', label: 'Next' }] }`,
};

/**
 * Pre-validate the config for common mistakes that Zod would silently strip.
 * This catches issues that TypeScript would reject but Zod allows.
 */
function preValidateConfig(config: unknown): FormattedValidationError[] {
  const errors: FormattedValidationError[] = [];

  if (!config || typeof config !== 'object') return errors;

  const formConfig = config as Record<string, unknown>;
  const fields = formConfig['fields'];

  if (!Array.isArray(fields)) return errors;

  // Check for mixed pages and non-pages at top level
  const hasPages = fields.some((f) => f && typeof f === 'object' && (f as Record<string, unknown>)['type'] === 'page');
  const hasNonPages = fields.some((f) => f && typeof f === 'object' && (f as Record<string, unknown>)['type'] !== 'page');
  if (hasPages && hasNonPages) {
    // Identify the non-page fields to give a specific fix suggestion
    const nonPageFields = fields
      .filter((f) => f && typeof f === 'object' && (f as Record<string, unknown>)['type'] !== 'page')
      .map((f) => {
        const field = f as Record<string, unknown>;
        const key = field['key'] as string | undefined;
        const type = field['type'] as string | undefined;
        return key ? `${key} (${type || 'unknown'})` : `(${type || 'unknown'})`;
      });

    const firstPage = fields.find((f) => f && typeof f === 'object' && (f as Record<string, unknown>)['type'] === 'page') as
      | Record<string, unknown>
      | undefined;
    const firstPageKey = firstPage?.['key'] as string | undefined;

    errors.push({
      path: 'fields',
      message:
        `Cannot mix page and non-page fields at top level. Found non-page fields: ${nonPageFields.join(', ')}. ` +
        `FIX: Move these fields INSIDE ${firstPageKey ? `the "${firstPageKey}" page` : 'the first page'}'s fields array. ` +
        `In multi-page mode, hidden fields and other non-page fields must be placed inside a page (usually the first one). ` +
        `See: ngforge_quick_lookup topic="multi-page-gotchas"`,
    });
  }

  function checkField(field: unknown, path: string, parentType?: string): void {
    if (!field || typeof field !== 'object') return;

    const f = field as Record<string, unknown>;
    const fieldType = f['type'] as string | undefined;
    const fieldKey = f['key'] as string | undefined;

    // Check for invalid properties on validators
    const validators = f['validators'];
    if (Array.isArray(validators)) {
      validators.forEach((validator, vIdx) => {
        if (validator && typeof validator === 'object') {
          const v = validator as Record<string, unknown>;
          for (const prop of INVALID_VALIDATOR_PROPS) {
            if (prop in v) {
              errors.push({
                path: `${path}.validators[${vIdx}].${prop}`,
                message: `"${prop}" is NOT a valid validator property. Error messages go in "validationMessages" at the FIELD level, not on the validator config. Use "kind" to specify an error key, then define the message in the field's validationMessages.`,
              });
            }
          }
        }
      });
    }

    // Check for invalid properties on containers (row, group, array - NOT page)
    if (['row', 'group', 'array'].includes(fieldType || '')) {
      for (const prop of INVALID_CONTAINER_PROPS) {
        if (prop in f) {
          errors.push({
            path: `${path}.${prop}`,
            message: `"${fieldType}" containers do NOT have a "${prop}" property. Container types (row, group, array, page) only contain other fields via the "fields" property.`,
          });
        }
      }

      // Check for forbidden validation-related properties
      for (const prop of CONTAINER_FORBIDDEN_PROPS) {
        if (prop in f) {
          const expected = EXPECTED_STRUCTURE[fieldType || ''] || '';
          errors.push({
            path: `${path}.${prop}`,
            message: `"${fieldType}" containers do NOT support "${prop}". Containers don't hold values or validate - they are purely for layout/grouping.${expected ? ` Expected structure: ${expected}` : ''}`,
          });
        }
      }

      // Check for non-hidden logic types on containers
      if ('logic' in f && Array.isArray(f['logic'])) {
        const nonHiddenLogic = (f['logic'] as Array<Record<string, unknown>>).filter(
          (l) => l && typeof l === 'object' && l['type'] !== 'hidden',
        );
        if (nonHiddenLogic.length > 0) {
          const invalidTypes = nonHiddenLogic.map((l) => `"${l['type']}"`).join(', ');
          errors.push({
            path: `${path}.logic`,
            message: `"${fieldType}" containers only support 'hidden' logic type. Found unsupported logic types: ${invalidTypes}. For other logic types (disabled, required, readonly, derivation), apply them to child fields instead.`,
          });
        }
      }
    }

    // Check page containers - they support hidden logic only
    if (fieldType === 'page') {
      for (const prop of INVALID_CONTAINER_PROPS) {
        if (prop in f) {
          errors.push({
            path: `${path}.${prop}`,
            message: `"page" containers do NOT have a "${prop}" property. Pages only contain other fields via the "fields" property. Expected structure: ${EXPECTED_STRUCTURE['page']}`,
          });
        }
      }
      for (const prop of CONTAINER_FORBIDDEN_PROPS) {
        if (prop in f) {
          errors.push({
            path: `${path}.${prop}`,
            message: `"page" containers do NOT support "${prop}". Pages are purely for multi-step form layout.`,
          });
        }
      }
    }

    // Check nesting constraints
    if (parentType && NESTING_RULES[parentType]) {
      const rules = NESTING_RULES[parentType];
      if (fieldType && rules.forbidden.includes(fieldType)) {
        errors.push({
          path: path,
          message: `"${fieldType}" is NOT allowed inside "${parentType}". ${rules.message}`,
        });
      }
    }

    // Check for fields that require 'options' property
    if (fieldType && FIELDS_REQUIRING_OPTIONS.includes(fieldType)) {
      const props = f['props'] as Record<string, unknown> | undefined;
      const hasOptionsAtFieldLevel = 'options' in f;
      const hasOptionsInProps = props && 'options' in props;

      if (!hasOptionsAtFieldLevel && hasOptionsInProps) {
        errors.push({
          path: `${path}.props.options`,
          message: `"options" MUST be at FIELD level, NOT inside props! Move it from props.options to the field's root level. Expected structure: ${EXPECTED_STRUCTURE[fieldType]}`,
        });
      } else if (!hasOptionsAtFieldLevel && !hasOptionsInProps) {
        errors.push({
          path: `${path}.options`,
          message: `"${fieldType}" field "${fieldKey || 'unknown'}" is MISSING required "options" property. Options must be an array of { label: string, value: T } objects at FIELD level. Expected structure: ${EXPECTED_STRUCTURE[fieldType]}`,
        });
      } else if (hasOptionsAtFieldLevel) {
        // Validate options format
        const options = f['options'];
        if (Array.isArray(options) && options.length > 0) {
          const firstOption = options[0];
          if (firstOption && typeof firstOption === 'object') {
            if (!('label' in firstOption) || !('value' in firstOption)) {
              errors.push({
                path: `${path}.options[0]`,
                message: `Invalid options format. Each option MUST have { label: string, value: T }. Found: ${JSON.stringify(firstOption)}. Correct format: [{ label: 'Display Text', value: 'actualValue' }, ...]`,
              });
            }
          } else if (typeof firstOption !== 'object') {
            errors.push({
              path: `${path}.options`,
              message: `Invalid options format. Options must be objects with { label, value }, not primitives. Found: ${JSON.stringify(options.slice(0, 3))}. Correct format: [{ label: 'Display Text', value: 'actualValue' }, ...]`,
            });
          }
        }
      }
    }

    // Check for slider with min/max in wrong place
    if (fieldType === 'slider') {
      const props = f['props'] as Record<string, unknown> | undefined;
      if (props) {
        const wrongProps: string[] = [];
        if ('min' in props) wrongProps.push('min (use minValue at field level)');
        if ('max' in props) wrongProps.push('max (use maxValue at field level)');
        if ('step' in props && !('step' in f)) wrongProps.push('step (move to field level)');

        if (wrongProps.length > 0) {
          errors.push({
            path: `${path}.props`,
            message: `Slider has properties in wrong location: ${wrongProps.join(', ')}. For sliders, use minValue, maxValue, and step at FIELD level, not inside props. Expected structure: ${EXPECTED_STRUCTURE['slider']}`,
          });
        }
      }
    }

    // Check hidden field requirements
    if (fieldType === 'hidden') {
      // Check for missing required 'value' property
      if (!('value' in f)) {
        errors.push({
          path: `${path}.value`,
          message: `Hidden field "${fieldKey || 'unknown'}" is MISSING REQUIRED "value" property. Hidden fields MUST have a value - they exist only to pass values through the form. Expected structure: ${EXPECTED_STRUCTURE['hidden']}`,
        });
      }

      // Check for forbidden properties on hidden fields
      const foundForbidden: string[] = [];
      for (const prop of FORBIDDEN_HIDDEN_PROPS) {
        if (prop in f) {
          foundForbidden.push(prop);
        }
      }

      if (foundForbidden.length > 0) {
        const propList = foundForbidden.map((p) => `"${p}"`).join(', ');
        errors.push({
          path: path,
          message: `Hidden field "${fieldKey || 'unknown'}" has FORBIDDEN properties: ${propList}. Hidden fields ONLY support: key, type, value, className. They do not render and cannot be validated. Expected structure: ${EXPECTED_STRUCTURE['hidden']}`,
        });
      }
    }

    // Check for missing 'fields' on containers
    if (['row', 'group', 'array', 'page'].includes(fieldType || '')) {
      if (!('fields' in f)) {
        errors.push({
          path: `${path}.fields`,
          message: `"${fieldType}" container "${fieldKey || 'unknown'}" is MISSING required "fields" property. Containers must have a fields array containing child fields. Expected structure: ${EXPECTED_STRUCTURE[fieldType || '']}`,
        });
      } else if (!Array.isArray(f['fields'])) {
        errors.push({
          path: `${path}.fields`,
          message: `"${fieldType}" container "${fieldKey || 'unknown'}" has invalid "fields" - must be an array of field objects, not ${typeof f['fields']}.`,
        });
      }
    }

    // Recursively check child fields with parent context
    const childFields = f['fields'];
    if (Array.isArray(childFields)) {
      childFields.forEach((child, idx) => {
        checkField(child, `${path}.fields[${idx}]`, fieldType);
      });
    }
  }

  fields.forEach((field, idx) => {
    checkField(field, `fields[${idx}]`, undefined);
  });

  return errors;
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

  // Pre-validate for common mistakes that Zod would silently strip
  const preErrors = preValidateConfig(config);

  const result = schema.safeParse(config);

  if (result.success && preErrors.length === 0) {
    return {
      valid: true,
      data: result.data,
    };
  }

  // Combine pre-validation errors with Zod errors
  const zodErrors = result.success ? [] : formatZodError(result.error, config);
  const allErrors = [...preErrors, ...zodErrors];

  return {
    valid: false,
    errors: allErrors,
    errorSummary: generateErrorSummary(allErrors),
  };
}

/**
 * Type guard for checking if a value is a valid form config for an integration.
 */
export function isValidFormConfig(uiIntegration: UiIntegration, config: unknown): boolean {
  return validateFormConfig(uiIntegration, config).valid;
}
