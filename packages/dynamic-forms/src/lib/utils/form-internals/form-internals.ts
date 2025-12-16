import { isSignal, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

interface ChildData {
  reader: FieldTree<unknown>;
}

interface ChildrenData {
  byPropertyKey: Map<string, ChildData>;
}

export interface FormInternals<T = unknown> {
  structure: {
    childrenMap: () => ChildrenData;
  };
  fieldProxy?: FieldTree<T>;
}

type FormInput = FormInternals | Signal<FormInternals> | unknown;

/**
 * Cache for normalized children maps.
 * Uses WeakMap keyed by FormInternals to avoid memory leaks.
 * The cache automatically clears when the form is garbage collected.
 */
const childrenMapCache = new WeakMap<FormInternals, Map<string, FieldTree<unknown>>>();

/**
 * Cache for field proxy lookups.
 * Uses WeakMap keyed by the node object to avoid memory leaks.
 */
const fieldProxyCache = new WeakMap<object, FieldTree<unknown> | null>();

/**
 * Type guard to check if a value has the FormInternals structure.
 */
export function isFormInternals(value: unknown): value is FormInternals {
  return (
    typeof value === 'object' &&
    value !== null &&
    'structure' in value &&
    typeof (value as FormInternals).structure?.childrenMap === 'function'
  );
}

/**
 * Type guard that unwraps signals and checks for FormInternals structure.
 * Use this when the input might be a signal wrapping FormInternals.
 */
export function hasFormStructure(form: FormInput): form is FormInternals | Signal<FormInternals> {
  const unwrapped = isSignal(form) ? form() : form;
  return isFormInternals(unwrapped);
}

/**
 * Unwraps a signal if needed and returns the FormInternals or null.
 */
function unwrapFormInput(form: FormInput): FormInternals | null {
  const unwrapped = isSignal(form) ? form() : form;
  return isFormInternals(unwrapped) ? unwrapped : null;
}

/**
 * Gets the normalized children map for a form.
 * Results are cached using WeakMap to avoid repeated normalization.
 *
 * @param form The form input (FormInternals, Signal<FormInternals>, or unknown)
 * @returns Normalized map of field keys to FieldTree, or null if not a form
 */
export function getChildrenMap(form: FormInput): Map<string, FieldTree<unknown>> | null {
  const target = unwrapFormInput(form);
  if (!target) {
    return null;
  }

  // Check cache first
  const cached = childrenMapCache.get(target);
  if (cached) {
    return cached;
  }

  // Create and cache normalized map
  const result = target.structure.childrenMap();
  const normalizedMap = new Map<string, FieldTree<unknown>>();
  for (const [key, childData] of result.byPropertyKey) {
    normalizedMap.set(key, childData.reader);
  }

  childrenMapCache.set(target, normalizedMap);
  return normalizedMap;
}

/**
 * Gets the field proxy from a form internals node.
 * Results are cached using WeakMap to avoid repeated lookups.
 *
 * @param node The node to get the field proxy from
 * @returns The field proxy FieldTree, or null if not available
 */
export function getFieldProxy<T = unknown>(node: unknown): FieldTree<T> | null {
  if (!isFormInternals(node)) {
    return null;
  }

  // Check cache first (cast needed for WeakMap key constraint)
  const nodeObj = node as object;
  if (fieldProxyCache.has(nodeObj)) {
    return fieldProxyCache.get(nodeObj) as FieldTree<T> | null;
  }

  // Cache the result
  const proxy = (node.fieldProxy as FieldTree<T>) ?? null;
  fieldProxyCache.set(nodeObj, proxy);
  return proxy;
}

export function getChildFieldTree(form: unknown, key: string): FieldTree<unknown> | null {
  const childrenMap = getChildrenMap(form);
  return childrenMap?.get(key) ?? null;
}
