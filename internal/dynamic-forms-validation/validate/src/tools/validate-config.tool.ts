import { z, ZodError } from 'zod';

// Import form config schemas
import { MatFormConfigSchema, MatFieldSchema } from '../../../material/src';
import { BsFormConfigSchema, BsFieldSchema } from '../../../bootstrap/src';
import { PrimeFormConfigSchema, PrimeFieldSchema } from '../../../primeng/src';
import { IonicFormConfigSchema, IonicFieldSchema } from '../../../ionic/src';
import { collectFieldTypeNames } from '../../../src/lib/schemas/field-type-names';

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
 * Map of UI integration to its all-fields schema.
 *
 * Kept alongside the form config schemas so the accepted field type names can be
 * read off the schema that decides validity, rather than retyped.
 */
const fieldSchemas: Record<UiIntegration, z.ZodTypeAny> = {
  material: MatFieldSchema,
  bootstrap: BsFieldSchema,
  primeng: PrimeFieldSchema,
  ionic: IonicFieldSchema,
};

/** Options for one validation run. */
export interface ValidateConfigOptions {
  /**
   * Rule ids the project has switched off, already resolved.
   *
   * Resolved by the caller so an unknown id fails once, where the config is
   * read, rather than silently doing nothing on every run.
   */
  disabledRules?: ReadonlySet<string>;
}

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
   * The named rule this violates, when it is a semantic one.
   *
   * Absent for anything the type system enforces on its own. Those carry no
   * identifier by design: they cannot be switched off, because a config that
   * breaks them does not compile whatever the validator says.
   */
  ruleId?: string;

  /**
   * `warning` when the project has disabled this rule.
   *
   * Disabling downgrades rather than silences, so an agent still sees the
   * finding and can tell it was a deliberate choice.
   */
  severity?: 'error' | 'warning';

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
 * Field type names accepted by each adapter, derived from its schema on first
 * use. Deriving rather than declaring is deliberate: the hand-written list this
 * replaced had drifted, so a known type with bad properties was reported as an
 * unknown type. See `collectFieldTypeNames`.
 */
const fieldTypeNameCache = new Map<UiIntegration, string[]>();

function knownFieldTypes(uiIntegration: UiIntegration): string[] {
  const cached = fieldTypeNameCache.get(uiIntegration);
  if (cached) return cached;

  const schema = fieldSchemas[uiIntegration];
  const names = schema ? collectFieldTypeNames(schema).sort() : [];
  fieldTypeNameCache.set(uiIntegration, names);
  return names;
}

/**
 * Properties that commonly cause errors and their correct placement.
 */
const PROPERTY_GUIDANCE: Record<string, string> = {
  options: 'options should be at FIELD level, not inside props',
  minValue: 'minValue should be at FIELD level, not inside props',
  maxValue: 'maxValue should be at FIELD level, not inside props',
  step: 'step should be at FIELD level, not inside props (for slider)',
  fields: 'fields should be at FIELD level, contains child fields for containers',
  template:
    'Arrays support two APIs: (1) Full API with `fields` for explicit item definitions, or (2) Simplified API with `template` + `value` for common cases. `fields` and `template` are mutually exclusive.',
  label: 'Container types (row, group, array, page) do NOT have a label property',
  title: 'Page fields do NOT have a title property',
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
  template:
    'Arrays support `template` (simplified API) or `fields` (full API). If using `template`, also provide `value` for initial data. They are mutually exclusive - do not use both.',
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
function formatZodError(error: ZodError, uiIntegration: UiIntegration, config?: unknown): FormattedValidationError[] {
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

          const validTypes = knownFieldTypes(uiIntegration);
          if (fieldType && !validTypes.includes(fieldType)) {
            message = `Unknown field type "${fieldType}". Valid types: ${validTypes.join(', ')}`;
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

            // Check for template on non-array containers (template is valid on arrays via simplified API)
            if (['group', 'row', 'page'].includes(fieldType) && 'template' in field) {
              mistakes.push('Use "fields" instead of "template"');
            }

            // Check for mutual exclusivity of fields and template on arrays
            if (fieldType === 'array' && 'template' in field && 'fields' in field) {
              mistakes.push('"fields" and "template" are mutually exclusive on arrays. Use one or the other.');
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
                // Skip 'template' suggestion for array fields (template is valid via simplified API)
                if (wrongProp === 'template' && fieldType === 'array') continue;
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
const CONTAINER_FORBIDDEN_PROPS = ['email', 'min', 'max', 'pattern', 'value'];

/**
 * Containers that own a schema path and therefore support container-level
 * validation, mirroring which interfaces extend `ContainerValidation`.
 *
 * The type system states the rule: a validator on a container runs against its
 * own subtree, so `ctx.value()` needs something to resolve to. `group` gives an
 * object and `array` gives the item list; `page`, `row` and `container` flatten
 * into their parent and have no path of their own.
 */
const VALIDATING_CONTAINERS = ['group', 'array'];

/** Container-level validation keys, accepted only by {@link VALIDATING_CONTAINERS}. */
const CONTAINER_VALIDATION_PROPS = ['validators', 'required', 'validationMessages'];

/** Array size constraints. Valid on `array`, meaningless elsewhere. */
const ARRAY_SIZE_PROPS = ['minLength', 'maxLength'];

/**
 * Field types that require the 'options' property.
 */
const FIELDS_REQUIRING_OPTIONS = ['select', 'radio', 'multi-checkbox'];

/**
 * Nesting rules - what a container may NOT contain.
 *
 * Only `forbidden` is recorded, because only `forbidden` is enforced. An
 * `allowed` list nobody reads drifts away from the rules that actually run the
 * moment a field type is added, which is exactly the failure this file exists
 * to catch.
 */
/**
 * What a container accepts, and what a row accepts with it.
 *
 * `ContainerAllowedChildren` admits every registered field type except `page`,
 * and containers nest, so the one prohibition is the one the type states.
 * Containers had no entry at all, which is why a page inside a container was the
 * only nesting the validator let through while the type rejected it.
 */
const CONTAINER_NESTING = {
  forbidden: ['page'],
  message: 'Containers and rows cannot contain pages. ALL top-level fields must be pages if using multi-page mode.',
};

const NESTING_RULES: Record<string, { forbidden: string[]; message: string }> = {
  page: {
    forbidden: ['page'],
    message: 'Pages cannot be nested inside other containers. ALL top-level fields must be pages if using multi-page mode.',
  },
  container: CONTAINER_NESTING,
  // A row resolves to a container at runtime, and the types say so outright:
  // `RowAllowedChildren` is an alias of `ContainerAllowedChildren`. Sharing the
  // entry keeps that an alias here too, rather than a fifth copy of the list
  // that can drift from the type it is derived from.
  row: CONTAINER_NESTING,
  group: {
    forbidden: ['page', 'group'],
    message: 'Groups cannot contain pages or other groups (no nested groups).',
  },
  array: {
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
  container: `{ key: 'containerKey', type: 'container', wrappers: [{ type: 'css', cssClasses: 'card' }], fields: [...childFields] }`,
  row: `{ key: 'rowKey', type: 'row', fields: [...childFields] }`,
  group: `{ key: 'groupKey', type: 'group', fields: [...childFields] }`,
  array: `Full API: { key: 'arrayKey', type: 'array', fields: [...itemDefs] } OR Simplified API: { key: 'arrayKey', type: 'array', template: { type: 'input', label: 'Item' }, value: [] }`,
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
      Record<string, unknown> | undefined;
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
                ruleId: 'core/validation-messages-location',
                message: `"${prop}" is NOT a valid validator property. Error messages go in "validationMessages" at the FIELD level, not on the validator config. Use "kind" to specify an error key, then define the message in the field's validationMessages.`,
              });
            }
          }
        }
      });
    }

    // Check for invalid properties on containers (row, group, array, container - NOT page)
    if (['row', 'group', 'array', 'container'].includes(fieldType || '')) {
      for (const prop of INVALID_CONTAINER_PROPS) {
        if (prop in f) {
          errors.push({
            path: `${path}.${prop}`,
            message: `"${fieldType}" containers do NOT have a "${prop}" property. Container types (row, group, array, page) only contain other fields via the "fields" property.`,
          });
        }
      }

      // Value-level properties, which no container holds.
      // Note: 'value' is allowed on array fields using the simplified API (template + value)
      for (const prop of CONTAINER_FORBIDDEN_PROPS) {
        if (prop in f) {
          // Skip 'value' check for arrays with 'template' (simplified API uses value for initial data)
          if (prop === 'value' && fieldType === 'array' && 'template' in f) {
            continue;
          }
          const expected = EXPECTED_STRUCTURE[fieldType || ''] || '';
          errors.push({
            path: `${path}.${prop}`,
            message: `"${fieldType}" containers do NOT support "${prop}". Containers don't hold values - they are purely for layout/grouping.${expected ? ` Expected structure: ${expected}` : ''}`,
          });
        }
      }

      // Container-level validation, which only containers with a schema path own.
      if (!VALIDATING_CONTAINERS.includes(fieldType || '')) {
        for (const prop of CONTAINER_VALIDATION_PROPS) {
          if (prop in f) {
            errors.push({
              path: `${path}.${prop}`,
              message: `"${fieldType}" containers do NOT support "${prop}". They flatten into their parent and have no schema path, so a container-level validator would have no value to run against. Use "group" or "array" for cross-field rules, or move the rule onto a child field.`,
            });
          }
        }
      }

      // Array size constraints are meaningless on anything that is not an array.
      if (fieldType !== 'array') {
        for (const prop of ARRAY_SIZE_PROPS) {
          if (prop in f) {
            errors.push({
              path: `${path}.${prop}`,
              message: `"${fieldType}" containers do NOT support "${prop}". Array size constraints apply to "array" fields only.`,
            });
          }
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
      for (const prop of [...CONTAINER_VALIDATION_PROPS, ...ARRAY_SIZE_PROPS]) {
        if (prop in f) {
          errors.push({
            path: `${path}.${prop}`,
            message: `"page" containers do NOT support "${prop}". Pages flatten into the form and have no schema path of their own.`,
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
          ruleId: 'core/nesting',
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
            ruleId: 'core/slider-range-properties',
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
          ruleId: 'core/hidden-minimal',
          message: `Hidden field "${fieldKey || 'unknown'}" has FORBIDDEN properties: ${propList}. Hidden fields ONLY support: key, type, value, className. They do not render and cannot be validated. Expected structure: ${EXPECTED_STRUCTURE['hidden']}`,
        });
      }
    }

    // Check for missing 'fields' on containers (array supports either 'fields' or 'template')
    if (['row', 'group', 'page', 'container'].includes(fieldType || '')) {
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

    // Container-specific: 'wrappers' is what makes a container a container.
    // Name the missing property rather than letting Zod report a generic union
    // failure, and steer away from the obvious wrong fix. A container and a
    // group are NOT interchangeable: `container` is registered with
    // valueHandling 'flatten' and a `group` with 'include', so swapping one for
    // the other silently reshapes the submitted value and moves the schema path
    // that validators run against.
    if (fieldType === 'container') {
      if (!('wrappers' in f)) {
        errors.push({
          path: `${path}.wrappers`,
          message: `"container" container "${fieldKey || 'unknown'}" is MISSING required "wrappers" property. Add a wrappers array naming the UI chrome to wrap the children in, or [] for no chrome. Do NOT switch to a "group" instead: a container flattens its children into the parent value, while a group nests them under its own key and owns a schema path, so the submitted value shape and validation behaviour both change. Expected structure: ${EXPECTED_STRUCTURE['container']}`,
        });
      } else if (!Array.isArray(f['wrappers'])) {
        errors.push({
          path: `${path}.wrappers`,
          message: `"container" container "${fieldKey || 'unknown'}" has invalid "wrappers" - must be an array of wrapper objects, not ${typeof f['wrappers']}.`,
        });
      }
    }

    // Array-specific: requires either 'fields' (full API) or 'template' (simplified API)
    if (fieldType === 'array') {
      const hasFields = 'fields' in f;
      const hasTemplate = 'template' in f;

      if (hasFields && hasTemplate) {
        errors.push({
          path: path,
          message: `Array "${fieldKey || 'unknown'}" has BOTH "fields" and "template". These are mutually exclusive. Use "fields" for the full API or "template" + "value" for the simplified API. ${EXPECTED_STRUCTURE['array']}`,
        });
      } else if (!hasFields && !hasTemplate) {
        errors.push({
          path: path,
          message: `Array "${fieldKey || 'unknown'}" is MISSING both "fields" and "template". Use "fields" (full API) or "template" + "value" (simplified API). ${EXPECTED_STRUCTURE['array']}`,
        });
      } else if (hasFields && !Array.isArray(f['fields'])) {
        errors.push({
          path: `${path}.fields`,
          message: `Array "${fieldKey || 'unknown'}" has invalid "fields" - must be an array of field objects, not ${typeof f['fields']}.`,
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

    // Recursively check template fields for simplified arrays
    if (fieldType === 'array' && 'template' in f) {
      const template = f['template'];
      if (Array.isArray(template)) {
        // Object array template: array of fields
        template.forEach((child, idx) => {
          checkField(child, `${path}.template[${idx}]`, fieldType);
        });
      } else if (template && typeof template === 'object') {
        // Primitive array template: single field
        checkField(template, `${path}.template`, fieldType);
      }
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
/**
 * Legacy camelCase array-action discriminants mapped to their kebab-case
 * canonical form. kebab is canonical as of 1.0; camelCase is a deprecated alias.
 */
const LEGACY_ARRAY_ACTION_TYPES: Record<string, string> = {
  addArrayItem: 'add-array-item',
  prependArrayItem: 'prepend-array-item',
  insertArrayItem: 'insert-array-item',
  removeArrayItem: 'remove-array-item',
  popArrayItem: 'pop-array-item',
  shiftArrayItem: 'shift-array-item',
};

/**
 * Deep-clones a config, rewriting any legacy camelCase array-action `type`
 * discriminant to its kebab-case canonical form so older/serialized configs
 * validate against the kebab-only schemas. Mirrors the library's runtime alias.
 */
function normalizeLegacyArrayActionTypes(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeLegacyArrayActionTypes);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] =
        key === 'type' && typeof val === 'string' && LEGACY_ARRAY_ACTION_TYPES[val]
          ? LEGACY_ARRAY_ACTION_TYPES[val]
          : normalizeLegacyArrayActionTypes(val);
    }
    return out;
  }
  return value;
}

/**
 * Apply the project's disabled rules.
 *
 * A disabled rule becomes a warning and stops counting towards validity, rather
 * than disappearing. The consumer is usually an agent, and a finding that
 * vanishes teaches it nothing, where one marked as deliberately off is
 * information it can act on and a reviewer can question.
 *
 * Only findings that carry a rule id can be downgraded. Everything else comes
 * from the types and is not something a project may switch off.
 */
function applyDisabledRules(errors: FormattedValidationError[], disabled: ReadonlySet<string>): FormattedValidationError[] {
  if (disabled.size === 0) return errors;

  return errors.map((error) =>
    error.ruleId && disabled.has(error.ruleId) ? { ...error, severity: 'warning' as const } : { ...error, severity: 'error' as const },
  );
}

export function validateFormConfig(uiIntegration: UiIntegration, config: unknown, options?: ValidateConfigOptions): ValidationResult {
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

  // Normalize legacy camelCase array-action discriminants to their kebab-case
  // canonical form so older/serialized configs validate against the kebab-only
  // schemas. Mirrors the library's runtime alias.
  const normalizedConfig = normalizeLegacyArrayActionTypes(config);

  // Pre-validate for common mistakes that Zod would silently strip
  const preErrors = preValidateConfig(normalizedConfig);

  const result = schema.safeParse(normalizedConfig);

  if (result.success && preErrors.length === 0) {
    return {
      valid: true,
      data: result.data,
    };
  }

  // Combine pre-validation errors with Zod errors
  const zodErrors = result.success ? [] : formatZodError(result.error, uiIntegration, normalizedConfig);
  const allErrors = applyDisabledRules([...preErrors, ...zodErrors], options?.disabledRules ?? new Set());

  // A config whose only findings are disabled rules is valid: that is what
  // disabling one means.
  const blocking = allErrors.filter((error) => error.severity !== 'warning');
  if (blocking.length === 0) {
    return { valid: true, data: result.success ? result.data : undefined, errors: allErrors };
  }

  return {
    valid: false,
    errors: allErrors,
    errorSummary: generateErrorSummary(blocking),
  };
}

/**
 * Type guard for checking if a value is a valid form config for an integration.
 */
export function isValidFormConfig(uiIntegration: UiIntegration, config: unknown): boolean {
  return validateFormConfig(uiIntegration, config).valid;
}
