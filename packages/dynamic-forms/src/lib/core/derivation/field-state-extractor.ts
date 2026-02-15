import { isSignal, untracked } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { FieldStateInfo, FormFieldStateMap } from '../../models/expressions/field-state-context';

/**
 * Known state properties on an Angular Signal Forms field instance.
 * Each is a signal that returns a boolean.
 */
const STATE_PROPERTIES = ['touched', 'dirty', 'valid', 'invalid', 'pending', 'hidden', 'readonly', 'disabled'] as const;

/**
 * Reads a boolean signal from a field instance, respecting the reactive flag.
 *
 * @internal
 */
function readFieldSignal(fieldInstance: Record<string, unknown>, prop: string, reactive: boolean): boolean {
  const signalFn = fieldInstance[prop];
  if (!isSignal(signalFn)) return false;
  return reactive ? !!(signalFn as () => boolean)() : !!untracked(signalFn as () => boolean);
}

/**
 * Creates a Proxy-based FieldStateInfo for a specific field accessor.
 *
 * Property access (e.g., `.touched`) lazily reads the field's signal.
 * `pristine` is computed as `!dirty`.
 *
 * @param fieldAccessor - A function that, when called, returns the field instance
 * @param reactive - If true, reads signals reactively (creates dependencies).
 *                   If false, reads signals with `untracked()` (no dependencies).
 * @returns A FieldStateInfo proxy, or undefined if the field accessor is invalid
 *
 * @internal
 */
export function createFieldStateProxy(
  fieldAccessor: (() => Record<string, unknown>) | undefined,
  reactive: boolean,
): FieldStateInfo | undefined {
  if (!fieldAccessor || !isSignal(fieldAccessor)) {
    return undefined;
  }

  return new Proxy({} as FieldStateInfo, {
    get(_target, prop: string): boolean | undefined {
      if (prop === 'pristine') {
        // pristine = !dirty, for ergonomics
        const instance = fieldAccessor();
        if (!instance || typeof instance !== 'object') return undefined;
        return !readFieldSignal(instance as Record<string, unknown>, 'dirty', reactive);
      }

      if (STATE_PROPERTIES.includes(prop as (typeof STATE_PROPERTIES)[number])) {
        const instance = fieldAccessor();
        if (!instance || typeof instance !== 'object') return undefined;
        return readFieldSignal(instance as Record<string, unknown>, prop, reactive);
      }

      return undefined;
    },
  });
}

/**
 * Creates a Proxy-based FormFieldStateMap for accessing any field's state by key.
 *
 * Property access like `[key]` navigates to `rootForm[key]` and returns
 * a FieldStateInfo proxy for that field.
 *
 * Uses an internal Map cache for proxy identity stability within a single
 * access chain (avoids redundant Proxy allocations).
 *
 * @param rootForm - The root FieldTree of the form
 * @param reactive - If true, reads signals reactively (creates dependencies).
 *                   If false, reads signals with `untracked()` (no dependencies).
 * @returns A FormFieldStateMap proxy
 *
 * @internal
 */
export function createFormFieldStateProxy(rootForm: FieldTree<unknown>, reactive: boolean): FormFieldStateMap {
  const cache = new Map<string, FieldStateInfo | undefined>();

  return new Proxy({} as FormFieldStateMap, {
    get(_target, key: string): FieldStateInfo | undefined {
      if (cache.has(key)) {
        return cache.get(key);
      }

      const fieldAccessor = navigateToFieldAccessor(rootForm, key);
      const proxy = createFieldStateProxy(fieldAccessor, reactive);
      cache.set(key, proxy);
      return proxy;
    },
  });
}

/**
 * Navigates the form tree to find a field accessor for the given key path.
 *
 * Supports dot-notation for nested paths (e.g., 'address.city').
 * Follows the same bracket-notation navigation pattern as `applyValueToForm`
 * in `derivation-applicator.ts`.
 *
 * @internal
 */
function navigateToFieldAccessor(rootForm: FieldTree<unknown>, keyPath: string): (() => Record<string, unknown>) | undefined {
  if (!keyPath) return undefined;

  const parts = keyPath.split('.');
  let current: unknown = rootForm;

  // Navigate to the parent for nested paths
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const next = (current as Record<string, unknown>)[part];

    if (next === undefined || next === null) return undefined;

    // If it's a signal (field accessor), call it to get the field tree
    if (isSignal(next)) {
      current = (next as () => unknown)();
    } else {
      current = next;
    }
  }

  // Get the final field accessor
  const finalKey = parts[parts.length - 1];
  const accessor = (current as Record<string, unknown>)[finalKey];

  if (isSignal(accessor)) {
    return accessor as () => Record<string, unknown>;
  }

  return undefined;
}
