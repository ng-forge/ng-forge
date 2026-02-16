import { type Signal, isSignal, untracked } from '@angular/core';
import type { FieldState, FieldTree } from '@angular/forms/signals';
import type { FieldStateInfo, FormFieldStateMap } from '../../models/expressions/field-state-context';
import type { FieldTreeRecord } from '../field-tree-utils';

/**
 * Known state properties on an Angular Signal Forms FieldState.
 * Each is a Signal<boolean> on the FieldState interface.
 */
const STATE_PROPERTIES = ['touched', 'dirty', 'valid', 'invalid', 'pending', 'hidden', 'readonly', 'disabled'] as const;

type StateProperty = (typeof STATE_PROPERTIES)[number];

/**
 * Reads a boolean signal from a FieldState, respecting the reactive flag.
 *
 * @internal
 */
function readStateSignal(fieldState: FieldState<unknown>, prop: StateProperty, reactive: boolean): boolean {
  const signalFn: Signal<boolean> | undefined = fieldState[prop];
  if (!signalFn || !isSignal(signalFn)) return false;
  return reactive ? !!signalFn() : !!untracked(signalFn);
}

/**
 * Resolves a field source (FieldTree or FieldState) to its FieldState.
 *
 * Accepts either:
 * - A FieldTree (signal accessor from form tree) — called to get the FieldState
 * - A direct FieldState object (from FieldContext) — used directly
 *
 * @internal
 */
function resolveFieldState(
  fieldSource: FieldTree<unknown> | FieldState<unknown> | undefined,
  reactive: boolean,
): FieldState<unknown> | undefined {
  if (!fieldSource) return undefined;

  if (isSignal(fieldSource)) {
    return reactive ? (fieldSource as FieldTree<unknown>)() : untracked(fieldSource as FieldTree<unknown>);
  }

  if (typeof fieldSource === 'object') {
    return fieldSource as FieldState<unknown>;
  }

  return undefined;
}

/**
 * Reads all state properties from a field source into a plain FieldStateInfo snapshot.
 *
 * Accepts either:
 * - A FieldTree (signal accessor from form tree) — called to get the FieldState
 * - A direct FieldState object (from FieldContext) — used directly
 *
 * @param fieldSource - A FieldTree or direct FieldState instance
 * @param reactive - If true, reads signals reactively (creates dependencies).
 *                   If false, reads signals with `untracked()` (no dependencies).
 * @returns A FieldStateInfo snapshot, or undefined if the source is invalid
 *
 * @internal
 */
export function readFieldStateInfo(
  fieldSource: FieldTree<unknown> | FieldState<unknown> | undefined,
  reactive: boolean,
): FieldStateInfo | undefined {
  const state = resolveFieldState(fieldSource, reactive);
  if (!state || typeof state !== 'object') return undefined;

  const entries = STATE_PROPERTIES.map((prop) => [prop, readStateSignal(state, prop, reactive)] as const);
  const dirty = entries.find(([prop]) => prop === 'dirty')![1];
  return Object.fromEntries([...entries, ['pristine', !dirty]]) as Record<StateProperty | 'pristine', boolean>;
}

/**
 * Creates a Proxy-based FormFieldStateMap for accessing any field's state by key.
 *
 * Property access like `[key]` navigates to `rootForm[key]` and returns
 * a FieldStateInfo snapshot for that field.
 *
 * Uses an internal Map cache for identity stability within a single
 * access chain (avoids redundant snapshot allocations).
 *
 * @param rootForm - The root FieldTree of the form
 * @param reactive - If true, reads signals reactively (creates dependencies).
 *                   If false, reads signals with `untracked()` (no dependencies).
 * @returns A FormFieldStateMap proxy
 *
 * @internal
 */
export function createFormFieldStateMap(rootForm: FieldTree<unknown>, reactive: boolean): FormFieldStateMap {
  const cache = new Map<string, FieldStateInfo | undefined>();

  return new Proxy({} as FormFieldStateMap, {
    get(_target, key: string): FieldStateInfo | undefined {
      if (cache.has(key)) {
        return cache.get(key);
      }

      const fieldAccessor = navigateToFieldAccessor(rootForm, key);
      const snapshot = readFieldStateInfo(fieldAccessor, reactive);
      cache.set(key, snapshot);
      return snapshot;
    },
  });
}

/**
 * Navigates the form tree to find a field accessor (FieldTree) for the given key path.
 *
 * Supports dot-notation for nested paths (e.g., 'address.city').
 * Follows the same bracket-notation navigation pattern as `applyValueToForm`
 * in `derivation-applicator.ts`.
 *
 * @internal
 */
function navigateToFieldAccessor(rootForm: FieldTree<unknown>, keyPath: string): FieldTree<unknown> | undefined {
  if (!keyPath) return undefined;

  const parts = keyPath.split('.');
  // FieldTree<T> = (() => FieldState<T>) & Subfields<T>, so sub-fields
  // are directly on the FieldTree — no need to call it during navigation
  let current = rootForm as FieldTreeRecord;

  for (let i = 0; i < parts.length - 1; i++) {
    const next = current[parts[i]];
    if (!next) return undefined;
    current = next as FieldTreeRecord;
  }

  return current[parts[parts.length - 1]];
}
