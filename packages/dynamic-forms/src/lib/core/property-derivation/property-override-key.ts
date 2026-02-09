/**
 * Builds a property override store key for a field.
 *
 * For non-array fields, the key is just the field's key.
 * For array item fields, the key includes the array path and concrete index.
 *
 * @param arrayKey - The array field key (e.g., 'contacts'), or undefined for non-array fields
 * @param index - The array item index, or undefined for non-array fields
 * @param fieldKey - The leaf field key (e.g., 'email')
 * @returns The store key (e.g., 'email' or 'contacts.0.email')
 *
 * @public
 */
export function buildPropertyOverrideKey(arrayKey: string | undefined, index: number | undefined, fieldKey: string): string {
  if (arrayKey != null && index != null) {
    return `${arrayKey}.${index}.${fieldKey}`;
  }
  return fieldKey;
}
