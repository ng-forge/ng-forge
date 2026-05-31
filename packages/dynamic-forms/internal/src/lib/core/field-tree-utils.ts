import { InjectionToken, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/** Represents a FieldTree node for dynamic bracket-access navigation. */
export type FieldTreeRecord = Record<string, FieldTree<unknown> | undefined>;

/**
 * Type representing a FieldTree for an array.
 * Extends FieldTree to add numeric indexing for accessing item FieldTrees.
 */
export type ArrayFieldTree<T> = FieldTree<T[]> & {
  readonly [index: number]: FieldTree<T> | undefined;
};

/** Get the length of an array FieldTree. */
export function getArrayLength<T>(arrayFieldTree: ArrayFieldTree<T>): number {
  const value = arrayFieldTree().value();
  return Array.isArray(value) ? value.length : 0;
}

/** Read-only view of a single field's observable state. */
export interface ReadonlyFieldTree<TValue = unknown> {
  readonly value: Signal<TValue>;
  readonly valid: Signal<boolean>;
  readonly invalid: Signal<boolean>;
  readonly touched: Signal<boolean>;
  readonly dirty: Signal<boolean>;
  readonly required: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly hidden: Signal<boolean>;
  readonly errors: Signal<readonly unknown[]>;
}

/**
 * Build a `ReadonlyFieldTree` by extracting the whitelisted read signals from a
 * Signal Forms `FieldTree`. Returns a fresh plain object — no casting, no proxying,
 * so consumers only see the narrow surface and Angular's `WritableSignal` capability
 * on `value` is hidden.
 */
export function toReadonlyFieldTree<TValue>(field: FieldTree<TValue>): ReadonlyFieldTree<TValue> {
  const state = field();
  return {
    value: state.value,
    valid: state.valid,
    invalid: state.invalid,
    touched: state.touched,
    dirty: state.dirty,
    required: state.required,
    disabled: state.disabled,
    hidden: state.hidden,
    errors: state.errors,
  };
}

/**
 * Write a value into a FieldTree's underlying signal. Signal Forms stores
 * `FieldState.value` as a `WritableSignal`; this helper centralises the cast
 * and warns if that contract ever changes (vs a silent no-op).
 */
export function writeToFieldValue<T>(value: Signal<T>, next: T, logger?: { warn: (msg: string) => void }): boolean {
  const candidate = value as { set?: (v: T) => void };
  if (typeof candidate.set !== 'function') {
    logger?.warn('writeToFieldValue: FieldState.value is not a WritableSignal — Signal Forms contract changed.');
    return false;
  }
  candidate.set(next);
  return true;
}

/**
 * DI-scoped cache for `ReadonlyFieldTree` views, keyed on the source FieldTree
 * identity. A fresh WeakMap per root injector keeps renders isolated under SSR —
 * Angular creates a new root injector per request, so there's no shared state
 * between server renders (same pattern as `COMPONENT_CACHE`).
 *
 * @internal
 */
export const READONLY_FIELD_TREE_CACHE = new InjectionToken<WeakMap<FieldTree<unknown>, ReadonlyFieldTree<unknown>>>(
  'READONLY_FIELD_TREE_CACHE',
  {
    providedIn: 'root',
    factory: () => new WeakMap(),
  },
);

/**
 * Cached variant of {@link toReadonlyFieldTree}. Each FieldTree instance is a
 * stable reference for the lifetime of its form, so one `ReadonlyFieldTree`
 * view per tree is enough. Callers on hot paths (`pushInputs` on every mapper
 * emission) avoid re-allocating the nine-property view object.
 *
 * @internal
 */
export function toReadonlyFieldTreeCached<TValue>(
  cache: WeakMap<FieldTree<unknown>, ReadonlyFieldTree<unknown>>,
  field: FieldTree<TValue>,
): ReadonlyFieldTree<TValue> {
  const key = field as FieldTree<unknown>;
  const cached = cache.get(key);
  if (cached) return cached as ReadonlyFieldTree<TValue>;

  const view = toReadonlyFieldTree(field);
  cache.set(key, view as ReadonlyFieldTree<unknown>);
  return view;
}
