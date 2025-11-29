import { FieldTree } from '@angular/forms/signals';

/**
 * Internal Angular Signal Forms structure interface.
 *
 * WARNING: These properties are internal Angular APIs and may change between versions.
 * This interface documents our dependency on Angular internals for form structure access.
 *
 * Used to access:
 * - `structure.childrenMap()` - Map of child field keys to their FieldTree instances
 * - `fieldProxy` - The FieldTree proxy for a FieldNode
 */
export interface FormInternals<T = unknown> {
  /**
   * Internal structure containing form graph information.
   * Present on forms created via `form()` function.
   */
  structure?: {
    /**
     * Returns a Map of child field keys to their FieldTree instances.
     * Keys are strings for object properties or stringified indices for arrays.
     */
    childrenMap?: () => Map<string, FieldTree<unknown>>;
  };

  /**
   * The FieldTree proxy for navigating the form graph.
   * Present on FieldNode instances.
   */
  fieldProxy?: FieldTree<T>;
}

/**
 * Type guard for checking if a form-like object has the internal structure property.
 *
 * @param form - The form object to check
 * @returns True if the form has a structure property with childrenMap
 */
export function hasFormStructure(form: unknown): form is FormInternals {
  return (
    typeof form === 'object' && form !== null && 'structure' in form && typeof (form as FormInternals).structure?.childrenMap === 'function'
  );
}

/**
 * Safely retrieves the childrenMap from a form's internal structure.
 *
 * @param form - The form object (from `form()` function or FieldTree)
 * @returns The childrenMap or null if not available
 */
export function getChildrenMap(form: unknown): Map<string, FieldTree<unknown>> | null {
  if (!hasFormStructure(form)) {
    return null;
  }
  return form.structure?.childrenMap?.() ?? null;
}

/**
 * Safely retrieves the fieldProxy from a form node.
 *
 * @param node - The form node (FieldNode or similar)
 * @returns The fieldProxy FieldTree or null if not available
 */
export function getFieldProxy<T = unknown>(node: unknown): FieldTree<T> | null {
  if (typeof node !== 'object' || node === null) {
    return null;
  }
  const proxy = (node as FormInternals<T>).fieldProxy;
  return proxy ?? null;
}

/**
 * Retrieves a child FieldTree from a form by key.
 *
 * @param form - The parent form
 * @param key - The child field key
 * @returns The child FieldTree or null if not found
 */
export function getChildFieldTree(form: unknown, key: string): FieldTree<unknown> | null {
  const childrenMap = getChildrenMap(form);
  return childrenMap?.get(key) ?? null;
}
