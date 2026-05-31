import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { FieldWithValidation } from '@ng-forge/dynamic-forms/internal';
import { FieldTypeDefinition, getFieldValueHandling } from '@ng-forge/dynamic-forms/internal';
import { hasChildFields, isGroupField } from '@ng-forge/dynamic-forms/internal';
import { normalizeFieldsArray } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormError } from '@ng-forge/dynamic-forms/internal';
import { Logger } from '@ng-forge/dynamic-forms/internal';

/** Data collected during a single config traversal. */
interface ConfigTraversalData {
  /**
   * Dot-scoped paths (e.g. `'address.street'`) — checked for form-value uniqueness:
   * two leaves landing at the same form-value path are a real conflict.
   */
  keys: string[];
  /**
   * Underscore-projected DOM-ID paths (e.g. `'address_street'`) — checked for
   * DOM `id` / `data-testid` uniqueness. Catches the otherwise-silent collision
   * where a top-level key like `'foo_bar'` would render the same DOM id as a
   * leaf `'bar'` inside group `'foo'`.
   */
  domIds: string[];
  types: Set<string>;
  regexErrors: string[];
  /** Own keys of value-bearing fields containing a dot (unsupported — nest via group fields). */
  dottedKeys: string[];
}

/**
 * Collects all field keys, types, and validates regex patterns from a field tree
 * by recursively traversing containers (page, row, group, array).
 *
 * @param collectKeys - When false, the entire subtree skips key collection (used
 *   when descending into an array container).
 */
function collectFieldData(
  fields: FieldDef<unknown>[],
  data: ConfigTraversalData,
  registry: Map<string, FieldTypeDefinition>,
  pathPrefix: string,
  collectKeys = true,
): void {
  for (const field of fields) {
    // Defensively skip only known non-include modes — unexpected/missing
    // valueHandling defaults back to participating in duplicate detection so a
    // mis-registered field type doesn't silently drop from collision checks.
    const valueHandling = field.type ? getFieldValueHandling(field.type, registry) : 'include';
    const participatesInValue = valueHandling !== 'exclude' && valueHandling !== 'flatten';

    // Dotted keys never nest (checked regardless of collectKeys, to cover array templates).
    if (field.key && field.key.includes('.') && participatesInValue) {
      data.dottedKeys.push(field.key);
    }

    if (collectKeys && field.key && participatesInValue) {
      const scopedKey = pathPrefix ? `${pathPrefix}.${field.key}` : field.key;
      data.keys.push(scopedKey);
      // Project to the DOM-ID format (dots → underscores) so we can detect
      // collisions like top-level `'foo_bar'` vs group `'foo'` + leaf `'bar'`.
      data.domIds.push(scopedKey.replace(/\./g, '_'));
    }
    if (field.type) {
      data.types.add(field.type);
    }

    const fieldWithValidation = field as FieldWithValidation;
    if ('pattern' in field && typeof fieldWithValidation.pattern === 'string') {
      validateRegexPattern(fieldWithValidation.pattern, field.key || '<unknown>', data.regexErrors);
    }

    if ('validators' in field && fieldWithValidation.validators) {
      for (const validator of fieldWithValidation.validators) {
        if (validator.type === 'pattern' && 'value' in validator && typeof validator.value === 'string') {
          validateRegexPattern(validator.value, field.key || '<unknown>', data.regexErrors);
        }
      }
    }

    if (hasChildFields(field)) {
      // Array item fields share template keys across items by design — stop collecting keys
      // once inside an array. Types and regex patterns are still validated.
      const childCollectKeys = collectKeys && field.type !== 'array';
      // Only group containers extend the scoping path — page/row flatten into the parent
      // scope, and array items use dynamic indices that aren't statically knowable.
      const childPrefix = isGroupField(field) && field.key ? (pathPrefix ? `${pathPrefix}.${field.key}` : field.key) : pathPrefix;
      const children = normalizeFieldsArray(field.fields) as (FieldDef<unknown> | FieldDef<unknown>[])[];
      for (const child of children) {
        if (Array.isArray(child)) {
          collectFieldData(child as FieldDef<unknown>[], data, registry, childPrefix, childCollectKeys);
        } else {
          collectFieldData([child], data, registry, childPrefix, childCollectKeys);
        }
      }
    }
  }
}

/** Validates a single regex pattern string, collecting errors rather than throwing. */
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
    throw new DynamicFormError(
      `Duplicate field keys detected: ${duplicateList}. Field keys must be unique within their group scope (the same key may appear inside different groups).`,
    );
  }
}

/**
 * Validates that the underscore-projected DOM-ID namespace has no collisions.
 *
 * @throws {DynamicFormError} When two scoped paths project to the same DOM ID
 */
function validateNoDomIdCollisions(domIds: string[]): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of domIds) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }

  if (duplicates.size > 0) {
    const duplicateList = Array.from(duplicates)
      .map((k) => `'${k}'`)
      .join(', ');
    throw new DynamicFormError(
      `DOM id collision detected for: ${duplicateList}. Group-nested keys are joined with '_' to form DOM ids ` +
        `(e.g. group 'foo' + leaf 'bar' renders as id='foo_bar'). A separate top-level key like 'foo_bar' or a different ` +
        `group/leaf pair that underscores to the same string will produce duplicate ids. Rename one of the colliding keys.`,
    );
  }
}

/**
 * Validates that every field type referenced in the config exists in the registry.
 * Logs a warning for unregistered types — unknown fields are skipped during rendering
 * rather than blocking the whole form (graceful degradation).
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
 * @throws {DynamicFormError} When duplicate keys or invalid regex patterns are detected
 */
export function validateFormConfig(fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>, logger: Logger): void {
  const data: ConfigTraversalData = {
    keys: [],
    domIds: [],
    types: new Set<string>(),
    regexErrors: [],
    dottedKeys: [],
  };

  collectFieldData(fields, data, registry, '');

  if (data.dottedKeys.length > 0) {
    const list = Array.from(new Set(data.dottedKeys))
      .map((k) => `'${k}'`)
      .join(', ');
    throw new DynamicFormError(
      `Field key(s) contain a dot: ${list}. Dotted keys are not supported — express nesting with 'group' fields ` +
        `(e.g. { type: 'group', key: 'address', fields: [{ type: 'input', key: 'city' }] }).`,
    );
  }

  validateNoDuplicateKeys(data.keys);
  validateNoDomIdCollisions(data.domIds);
  validateFieldTypesRegistered(data.types, registry, logger);

  if (data.regexErrors.length > 0) {
    throw new DynamicFormError(
      data.regexErrors.length === 1
        ? data.regexErrors[0]
        : `Invalid regex pattern(s) found:\n${data.regexErrors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }
}
