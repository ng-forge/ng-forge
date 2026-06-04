import { type Signal, isSignal, untracked } from '@angular/core';
import type { FieldTree, ReadonlyFieldState } from '@angular/forms/signals';
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
function readStateSignal(fieldState: ReadonlyFieldState<unknown>, prop: StateProperty, reactive: boolean): boolean {
  const signalFn: Signal<boolean> | undefined = fieldState[prop];
  if (!signalFn || !isSignal(signalFn)) return false;
  return reactive ? !!signalFn() : !!untracked(signalFn);
}

/**
 * Resolves a field source (FieldTree or FieldState) to its FieldState.
 *
 * @internal
 */
function resolveFieldState(
  fieldSource: FieldTree<unknown> | ReadonlyFieldState<unknown> | undefined,
  reactive: boolean,
): ReadonlyFieldState<unknown> | undefined {
  if (!fieldSource) return undefined;

  // FieldTree: signal or callable Proxy — invoke to get the FieldState
  if (typeof fieldSource === 'function') {
    return reactive ? (fieldSource as FieldTree<unknown>)() : untracked(fieldSource as FieldTree<unknown>);
  }

  // Direct FieldState object (from FieldContext)
  if (typeof fieldSource === 'object') {
    return fieldSource as ReadonlyFieldState<unknown>;
  }

  return undefined;
}

/**
 * Creates a lazy FieldStateInfo that only reads state properties when accessed.
 *
 * @param fieldSource - A FieldTree or direct FieldState instance
 * @param reactive - If true, reads signals reactively (creates dependencies).
 *                   If false, reads signals with `untracked()` (no dependencies).
 * @returns A FieldStateInfo proxy with lazy property access, or undefined if the source is invalid
 * @internal
 */
export function readFieldStateInfo(
  fieldSource: FieldTree<unknown> | ReadonlyFieldState<unknown> | undefined,
  reactive: boolean,
): FieldStateInfo | undefined {
  const state = resolveFieldState(fieldSource, reactive);
  if (!state || typeof state !== 'object') return undefined;

  const knownProperties = new Set<string>([...STATE_PROPERTIES, 'pristine']);

  return new Proxy({} as FieldStateInfo, {
    get(_target, prop: string): boolean {
      if (prop === 'pristine') {
        return !readStateSignal(state, 'dirty', reactive);
      }
      if (STATE_PROPERTIES.includes(prop as StateProperty)) {
        return readStateSignal(state, prop as StateProperty, reactive);
      }
      return false;
    },
    has(_target, prop: string): boolean {
      return knownProperties.has(prop);
    },
  });
}

/**
 * Creates a Proxy-based FormFieldStateMap for accessing any field's state by key.
 *
 * @param rootForm - The root FieldTree of the form
 * @param reactive - If true, reads signals reactively (creates dependencies).
 *                   If false, reads signals with `untracked()` (no dependencies).
 * @returns A FormFieldStateMap proxy
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
    has(_target, key: string): boolean {
      return navigateToFieldAccessor(rootForm, key) !== undefined;
    },
  });
}

/**
 * Navigates the form tree to find a field accessor (FieldTree) for the given key path.
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
