import { Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Represents a FieldTree node for dynamic bracket-access navigation.
 *
 * TypeScript's `Subfields<T>` type on `FieldTree` only allows statically-known keys,
 * but at runtime the form tree supports arbitrary string key access (e.g., `rootForm['address']`).
 * This type makes that dynamic access explicit: each string key maps to a `FieldTree | undefined`.
 */
export type FieldTreeRecord = Record<string, FieldTree<unknown> | undefined>;

/**
 * Type representing a FieldTree for an array.
 * Extends FieldTree to add numeric indexing for accessing item FieldTrees.
 */
export type ArrayFieldTree<T> = FieldTree<T[]> & {
  readonly [index: number]: FieldTree<T> | undefined;
};

/**
 * Get the length of an array FieldTree.
 */
export function getArrayLength<T>(arrayFieldTree: ArrayFieldTree<T>): number {
  const value = arrayFieldTree().value();
  return Array.isArray(value) ? value.length : 0;
}

/**
 * Read-only view of a single field's observable state.
 *
 * Whitelisted read signals copied from Angular Signal Forms' `FieldState` so wrappers
 * can observe a field without being able to mutate it. New write-capable members
 * added in future Angular versions are excluded by default (the `Pick` list stays
 * the source of truth).
 *
 * `value` is narrowed from `WritableSignal<TValue>` to `Signal<TValue>` so consumers
 * cannot write through it.
 */
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
