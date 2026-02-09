/**
 * Sentinel value for the `$` placeholder index used in registration keys.
 *
 * The property derivation system uses two key formats for array fields:
 * - **Placeholder format** (`items.$.email`) — used by the collector/orchestrator to register
 *   derivations and by the fast-path `hasField()` check. The `$` acts as a wildcard
 *   representing "any index".
 * - **Concrete format** (`items.0.email`) — used at render time to look up overrides
 *   for a specific array item.
 *
 * Pass `PLACEHOLDER_INDEX` as the `index` parameter to produce the placeholder format.
 *
 * @public
 */
export const PLACEHOLDER_INDEX = '$' as const;

/**
 * Builds a property override store key for a field.
 *
 * For non-array fields, the key is just the field's key.
 * For array item fields, the key includes the array path and either a concrete
 * index (e.g., `contacts.0.email`) or the `$` placeholder (e.g., `contacts.$.email`).
 *
 * @param arrayKey - The array field key (e.g., 'contacts'), or undefined for non-array fields
 * @param index - The array item index, `PLACEHOLDER_INDEX` for the wildcard format, or undefined for non-array fields
 * @param fieldKey - The leaf field key (e.g., 'email')
 * @returns The store key (e.g., 'email', 'contacts.0.email', or 'contacts.$.email')
 *
 * @public
 */
export function buildPropertyOverrideKey(
  arrayKey: string | undefined,
  index: number | typeof PLACEHOLDER_INDEX | undefined,
  fieldKey: string,
): string {
  if (arrayKey != null && index != null) {
    return `${arrayKey}.${index}.${fieldKey}`;
  }
  return fieldKey;
}
