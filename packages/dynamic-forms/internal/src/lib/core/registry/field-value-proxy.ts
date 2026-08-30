import { untracked } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';

/**
 * A lazy, read-only view over the form value that subscribes fine-grainedly:
 * reading `formValue.foo` resolves `foo` through the Signal Forms `FieldTree` and
 * subscribes to only that field's `value()` signal, so a condition/validator that
 * references one field re-runs only when that field changes (instead of every
 * field, as reading the whole-form value would cause).
 *
 * Whole-object operations (spread, `Object.keys`) fall back to the eager whole-form
 * value and subscribe to everything — correct for code that needs all keys.
 *
 * @param getRootForm - the current root `FieldTree` (structural; changes on rebuild).
 * @param getRootFormValue - the eager whole-form value; fallback for keys absent
 *   from the tree and for whole-object enumeration.
 */
export function createFieldValueProxy(
  getRootForm: () => FieldTree<unknown> | undefined,
  getRootFormValue: () => Record<string, unknown>,
): Record<string, unknown> {
  // Resolves a key to its FieldTree child accessor, or undefined when not a field.
  const resolveAccessor = (key: string): (() => unknown) | undefined => {
    const root = getRootForm() as Record<string, unknown> | undefined;
    const accessor = root?.[key];
    return typeof accessor === 'function' ? (accessor as () => unknown) : undefined;
  };

  // `hit` is false when the key is not a navigable field, so the caller falls back.
  const readField = (key: string): { hit: boolean; value: unknown } => {
    const accessor = resolveAccessor(key);
    if (accessor) {
      // FieldState structurally (untracked); read `value()` tracked to subscribe to this field only.
      const state = untracked(() => accessor());
      const valueSig = state && (state as { value?: unknown }).value;
      if (typeof valueSig === 'function') {
        return { hit: true, value: (valueSig as () => unknown)() };
      }
    }
    return { hit: false, value: undefined };
  };

  return new Proxy({} as Record<string, unknown>, {
    get(_target, prop) {
      if (typeof prop === 'symbol') return undefined;
      const { hit, value } = readField(prop);
      return hit ? value : getRootFormValue()[prop];
    },
    has(_target, prop) {
      if (typeof prop === 'symbol') return false;
      // A Signal Forms FieldTree is a Proxy with no `has` trap, so `prop in tree` is
      // false even for real fields. Probe the child accessor instead — using `in`
      // here sent every structured condition down the whole-form fallback below.
      if (resolveAccessor(prop)) return true;
      return prop in getRootFormValue();
    },
    // Enumeration needs every key, so it reads the eager value (subscribes to all).
    ownKeys() {
      return Reflect.ownKeys(getRootFormValue());
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (typeof prop === 'symbol') return undefined;
      const whole = getRootFormValue();
      if (!(prop in whole)) return undefined;
      const { hit, value } = readField(prop);
      return { value: hit ? value : whole[prop], enumerable: true, configurable: true, writable: false };
    },
    set() {
      return false; // read-only view
    },
  });
}
