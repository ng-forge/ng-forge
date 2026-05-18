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
 * For non-array fields, the key is the dot-joined group ancestors plus the
 * field's leaf key (e.g., `address.street` for `street` inside `address`).
 * For array item fields, the key includes the array path, either a concrete
 * index or the `$` placeholder, and any group ancestors INSIDE the array
 * item (e.g., `contacts.0.email`, `contacts.$.email`, or
 * `contacts.0.profile.email` for a group nested under each contact).
 *
 * `groupPath` matches the form-value path of nested groups (collector resets
 * it at array boundaries — see `property-derivation-collector.ts`), so the
 * resulting key always mirrors the field's location in `formValue`.
 *
 * @param arrayKey - The array field key (e.g., 'contacts'), or undefined for non-array fields
 * @param index - The array item index, `PLACEHOLDER_INDEX` for the wildcard format, or undefined for non-array fields
 * @param fieldKey - The leaf field key (e.g., 'email')
 * @param groupPath - Dot-joined group ancestors scoped to the current array item (or top-level), or undefined when not inside any group
 * @returns The store key (e.g., 'email', 'address.street', 'contacts.0.email', 'contacts.$.profile.email')
 *
 * @public
 */
export function buildPropertyOverrideKey(
  arrayKey: string | undefined,
  index: number | typeof PLACEHOLDER_INDEX | undefined,
  fieldKey: string,
  groupPath?: string,
): string {
  const leafScope = groupPath ? `${groupPath}.${fieldKey}` : fieldKey;
  if (arrayKey != null && index != null) {
    return `${arrayKey}.${index}.${leafScope}`;
  }
  return leafScope;
}
