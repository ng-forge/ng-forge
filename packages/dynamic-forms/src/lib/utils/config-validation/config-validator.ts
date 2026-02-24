import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { FieldTypeDefinition } from '../../models/field-type';
import { hasChildFields } from '../../models/types/type-guards';
import { normalizeFieldsArray } from '../object-utils';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { Logger } from '../../providers/features/logger/logger.interface';

/** Data collected during a single config traversal. */
interface ConfigTraversalData {
  keys: string[];
  types: Set<string>;
  regexErrors: string[];
}

/**
 * Collects all field keys, types, and validates regex patterns from a field tree
 * by recursively traversing containers (page, row, group, array).
 *
 * @param collectKeys - Whether to add field keys to data.keys for duplicate detection.
 *   Set to false when inside an array container: array item fields share template keys
 *   across items by design (e.g. every item has 'name', 'email'), so they must not
 *   participate in global duplicate-key checking.
 */
function collectFieldData(fields: FieldDef<unknown>[], data: ConfigTraversalData, collectKeys = true): void {
  for (const field of fields) {
    if (collectKeys && field.key) {
      data.keys.push(field.key);
    }
    if (field.type) {
      data.types.add(field.type);
    }

    const validationField = field as FieldDef<unknown> & FieldWithValidation;
    if (typeof validationField.pattern === 'string') {
      validateRegexPattern(validationField.pattern, field.key || '<unknown>', data.regexErrors);
    }

    if (validationField.validators) {
      for (const validator of validationField.validators) {
        if (validator.type === 'pattern' && 'value' in validator && typeof validator.value === 'string') {
          validateRegexPattern(validator.value, field.key || '<unknown>', data.regexErrors);
        }
      }
    }

    if (hasChildFields(field)) {
      // Array item fields share template keys across items by design — stop collecting keys
      // once inside an array. Types and regex patterns are still validated.
      const childCollectKeys = collectKeys && field.type !== 'array';
      const children = normalizeFieldsArray(field.fields) as (FieldDef<unknown> | FieldDef<unknown>[])[];
      for (const child of children) {
        if (Array.isArray(child)) {
          collectFieldData(child as FieldDef<unknown>[], data, childCollectKeys);
        } else {
          collectFieldData([child], data, childCollectKeys);
        }
      }
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
 * Logs a warning for unregistered types — unknown fields are skipped during rendering
 * rather than blocking the whole form (graceful degradation).
 *
 * Skips validation when the registry is empty (no UI adapter has been registered),
 * since the core library tests operate without a field registry.
 */
function validateFieldTypesRegistered(allTypes: Set<string>, registry: Map<string, FieldTypeDefinition>, logger: Logger): void {
  if (registry.size === 0) return;

  const unregistered: string[] = [];

  for (const type of allTypes) {
    if (!registry.has(type)) {
      unregistered.push(type);
    }
  }

  if (unregistered.length > 0) {
    const typeList = unregistered.map((t) => `'${t}'`).join(', ');
    logger.warn(
      `Unknown field type(s): ${typeList}. Register them via provideDynamicForm(...withXxxFields()) or a custom registry entry. These fields will be skipped during rendering.`,
    );
  }
}

/**
 * Validates a form config at bootstrap time, checking for:
 * - Duplicate field keys (throws — this is always a developer error)
 * - Unregistered field types (warns — form degrades gracefully, skipping unknown fields)
 * - Invalid regex patterns in validators (throws — invalid regex will cause runtime errors)
 *
 * Should be called once during form setup, before fields are processed.
 *
 * @throws {DynamicFormError} When duplicate keys or invalid regex patterns are detected
 */
export function validateFormConfig(fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>, logger: Logger): void {
  const data: ConfigTraversalData = {
    keys: [],
    types: new Set<string>(),
    regexErrors: [],
  };

  collectFieldData(fields, data);

  validateNoDuplicateKeys(data.keys);
  validateFieldTypesRegistered(data.types, registry, logger);

  if (data.regexErrors.length > 0) {
    throw new DynamicFormError(data.regexErrors[0]);
  }
}
