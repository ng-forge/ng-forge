/** Sentinel value for the `$` placeholder index used in registration keys. */
export const PLACEHOLDER_INDEX = '$' as const;

/**
 * Builds a property override store key for a field.
 *
 * @param arrayKey - The array field key (e.g., 'contacts'), or undefined for non-array fields
 * @param index - The array item index, `PLACEHOLDER_INDEX` for the wildcard format, or undefined for non-array fields
 * @param fieldKey - The leaf field key (e.g., 'email')
 * @param groupPath - Dot-joined group ancestors scoped to the current array item (or top-level), or undefined when not inside any group
 * @returns The store key (e.g., 'email', 'address.street', 'contacts.0.email', 'contacts.$.profile.email')
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
