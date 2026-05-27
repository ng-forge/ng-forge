import { FieldMeta } from '../definitions/base/field-meta';

/**
 * Applies meta attributes to a DOM element and tracks which attributes were applied.
 *
 * @param element - The DOM element to apply attributes to
 * @param meta - The meta object containing attributes to apply
 * @param previouslyApplied - Set of attribute names that were previously applied
 * @returns A new Set containing the attribute names that were applied
 */
export function applyMetaToElement(element: Element, meta: FieldMeta | undefined, previouslyApplied: Set<string>): Set<string> {
  const newApplied = new Set<string>();

  // Remove old attributes no longer in meta
  for (const attr of previouslyApplied) {
    if (!meta || !(attr in meta) || meta[attr] === undefined) {
      element.removeAttribute(attr);
    }
  }

  if (!meta) return newApplied;

  // Apply new attributes
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === null) continue;

    element.setAttribute(key, String(value));
    newApplied.add(key);
  }

  return newApplied;
}
