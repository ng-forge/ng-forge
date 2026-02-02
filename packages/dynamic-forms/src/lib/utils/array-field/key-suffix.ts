import { FieldDef } from '../../definitions/base/field-def';

/**
 * Extracts an 8-character suffix from a UUID.
 * Used to create stable, unique key suffixes for array items.
 */
export function extractSuffixFromUuid(uuid: string): string {
  return uuid.replace(/-/g, '').slice(0, 8);
}

/**
 * Adds a suffix to a field key.
 * Returns undefined if the original key is undefined.
 */
function addSuffixToKey(key: string | undefined, suffix: string): string | undefined {
  return key ? `${key}_${suffix}` : key;
}

/**
 * Recursively adds a suffix to all keys in a field definition tree.
 * This ensures unique DOM IDs and form keys across array items.
 *
 * @param field - The field definition to process
 * @param suffix - The 8-char suffix to append (e.g., "a1b2c3d4")
 * @returns A new field definition with suffixed keys
 */
export function addKeySuffixToField<T extends FieldDef<unknown>>(field: T, suffix: string): T {
  const suffixedField = {
    ...field,
    key: addSuffixToKey(field.key, suffix),
  } as T;

  // Recursively handle nested fields (groups, rows, pages)
  if ('fields' in field && Array.isArray(field.fields)) {
    (suffixedField as unknown as { fields: FieldDef<unknown>[] }).fields = field.fields.map((child) =>
      addKeySuffixToField(child as FieldDef<unknown>, suffix),
    );
  }

  return suffixedField;
}

/**
 * Adds a suffix to all keys in an array of field definitions.
 */
export function addKeySuffixToFields<T extends FieldDef<unknown>>(fields: readonly T[], suffix: string): T[] {
  return fields.map((field) => addKeySuffixToField(field, suffix));
}

/**
 * Strips the suffix from a key.
 * Returns the original key if no suffix pattern is found.
 */
function stripSuffixFromKey(key: string, suffix: string): string {
  const suffixPattern = `_${suffix}`;
  return key.endsWith(suffixPattern) ? key.slice(0, -suffixPattern.length) : key;
}

/**
 * Recursively strips suffixes from all keys in an object value.
 * Used when syncing array item values back to the parent form.
 *
 * @param value - The object value with suffixed keys
 * @param suffix - The suffix to remove
 * @returns A new object with original (unsuffixed) keys
 */
export function stripKeySuffixFromValue(value: unknown, suffix: string): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => stripKeySuffixFromValue(item, suffix));
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      const cleanKey = stripSuffixFromKey(key, suffix);
      result[cleanKey] = stripKeySuffixFromValue(val, suffix);
    }
    return result;
  }

  return value;
}

/**
 * Recursively adds suffixes to all keys in an object value.
 * Used when initializing array item values from parent form.
 *
 * @param value - The object value with original keys
 * @param suffix - The suffix to add
 * @returns A new object with suffixed keys
 */
export function addKeySuffixToValue(value: unknown, suffix: string): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => addKeySuffixToValue(item, suffix));
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      const suffixedKey = `${key}_${suffix}`;
      result[suffixedKey] = addKeySuffixToValue(val, suffix);
    }
    return result;
  }

  return value;
}
