import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { FieldTypeDefinition } from '../../models/field-type';
import { hasChildFields } from '../../models/types/type-guards';
import { normalizeFieldsArray } from '../object-utils';
import { DynamicFormError } from '../../errors/dynamic-form-error';

/** Data collected during a single config traversal. */
interface ConfigTraversalData {
  keys: string[];
  types: Set<string>;
  regexErrors: string[];
}

/**
 * Collects all field keys, types, and validates regex patterns from a field tree
 * by recursively traversing containers (page, row, group, array).
 */
function collectFieldData(fields: FieldDef<unknown>[], data: ConfigTraversalData): void {
  for (const field of fields) {
    if (field.key) {
      data.keys.push(field.key);
    }
    if (field.type) {
      data.types.add(field.type);
    }

    // Validate regex patterns in shorthand `pattern` property
    const validationField = field as FieldDef<unknown> & FieldWithValidation;
    if (typeof validationField.pattern === 'string') {
      validateRegexPattern(validationField.pattern, field.key || '<unknown>', data.regexErrors);
    }

    // Validate regex patterns in `validators` array
    if (validationField.validators) {
      for (const validator of validationField.validators) {
        if (validator.type === 'pattern' && 'value' in validator && typeof validator.value === 'string') {
          validateRegexPattern(validator.value, field.key || '<unknown>', data.regexErrors);
        }
      }
    }

    if (hasChildFields(field)) {
      collectFieldData(normalizeFieldsArray(field.fields) as FieldDef<unknown>[], data);
    }
  }
}

/**
 * Validates a single regex pattern string, collecting errors rather than throwing.
 */
function validateRegexPattern(pattern: string, fieldKey: string, errors: string[]): void {
  try {
    new RegExp(pattern);
  } catch (e) {
    errors.push(`Invalid regex pattern in validator for field '${fieldKey}': '${pattern}' — ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * Validates that no duplicate field keys exist in the config.
 * Throws a DynamicFormError listing all duplicates if any are found.
 *
 * @throws {DynamicFormError} When duplicate keys are detected
 */
function validateNoDuplicateKeys(allKeys: string[]): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const key of allKeys) {
    if (seen.has(key)) {
      duplicates.add(key);
    }
    seen.add(key);
  }

  if (duplicates.size > 0) {
    const duplicateList = Array.from(duplicates)
      .map((k) => `'${k}'`)
      .join(', ');
    throw new DynamicFormError(`Duplicate field keys detected: ${duplicateList}. Each field key must be unique within a form config.`);
  }
}

/**
 * Validates that every field type referenced in the config exists in the registry.
 * Throws a DynamicFormError listing all unregistered types if any are found.
 *
 * Skips validation when the registry is empty (no UI adapter has been registered),
 * since the core library tests operate without a field registry.
 *
 * @throws {DynamicFormError} When unregistered field types are detected
 */
function validateFieldTypesRegistered(allTypes: Set<string>, registry: Map<string, FieldTypeDefinition>): void {
  if (registry.size === 0) return;

  const unregistered: string[] = [];

  for (const type of allTypes) {
    if (!registry.has(type)) {
      unregistered.push(type);
    }
  }

  if (unregistered.length > 0) {
    const typeList = unregistered.map((t) => `'${t}'`).join(', ');
    throw new DynamicFormError(
      `Unknown field type(s): ${typeList}. Register them via provideDynamicForm(...withXxxFields()) or a custom registry entry.`,
    );
  }
}

/**
 * Validates a form config at bootstrap time, checking for:
 * - Duplicate field keys
 * - Unregistered field types
 * - Invalid regex patterns in validators
 *
 * Should be called once during form setup, before fields are processed.
 *
 * @throws {DynamicFormError} When validation errors are detected
 */
export function validateFormConfig(fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>): void {
  const data: ConfigTraversalData = {
    keys: [],
    types: new Set<string>(),
    regexErrors: [],
  };

  collectFieldData(fields, data);

  validateNoDuplicateKeys(data.keys);
  validateFieldTypesRegistered(data.types, registry);

  if (data.regexErrors.length > 0) {
    throw new DynamicFormError(data.regexErrors[0]);
  }
}
