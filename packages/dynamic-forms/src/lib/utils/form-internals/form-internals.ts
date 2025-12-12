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

export function getChildrenMap(form: FormInput): Map<string, FieldTree<unknown>> | null {
  const target = unwrapFormInput(form);
  if (!target) {
    return null;
  }

  const result = target.structure.childrenMap();
  const normalizedMap = new Map<string, FieldTree<unknown>>();
  for (const [key, childData] of result.byPropertyKey) {
    normalizedMap.set(key, childData.reader);
  }
  return normalizedMap;
}

export function getFieldProxy<T = unknown>(node: unknown): FieldTree<T> | null {
  if (!isFormInternals(node)) {
    return null;
  }
  return (node.fieldProxy as FieldTree<T>) ?? null;
}

export function getChildFieldTree(form: unknown, key: string): FieldTree<unknown> | null {
  const childrenMap = getChildrenMap(form);
  return childrenMap?.get(key) ?? null;
}
