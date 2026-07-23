import { untracked } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';

/**
 * A lazy, read-only view over the form value that subscribes fine-grainedly.
 *
 * The naive approach — reading `RootFormRegistryService.formValue()` (the whole
 * form value) — makes every condition/validator/derivation depend on the entire
 * form, so changing ANY field re-evaluates ALL of them (O(N) fan-out per
 * keystroke). Instead this proxy resolves each accessed top-level key through the
 * Signal Forms `FieldTree`, reading only that field's `value()` signal — so a
 * consumer subscribes to just the fields its expression actually touches.
 *
 * Property access (`formValue.foo`, `getNestedValue(formValue, 'a.b')`) reads one
 * field's signal. Whole-object operations (spread, `Object.keys`, `JSON.stringify`)
 * fall back to the eager whole-form value and therefore subscribe to everything —
 * the correct, conservative behaviour for code that genuinely needs all keys.
 *
 * @param getRootForm - reads the current root `FieldTree` (structural; changes
 *   only when the form is rebuilt).
 * @param getRootFormValue - reads the eager whole-form value; used as a fallback
 *   for keys absent from the tree and for whole-object enumeration.
 */
export function createFieldValueProxy(
  getRootForm: () => FieldTree<unknown> | undefined,
  getRootFormValue: () => Record<string, unknown>,
): Record<string, unknown> {
  // Returns { hit } false when the key is not a navigable field on the tree, so
  // the caller can fall back to the eager whole-form value.
  const readField = (key: string): { hit: boolean; value: unknown } => {
    const root = getRootForm() as Record<string, unknown> | undefined;
    const accessor = root?.[key];
    if (typeof accessor === 'function') {
      // Get the FieldState structurally (untracked), then read `value()` tracked
      // so the consumer subscribes to THIS field's value only.
      const state = untracked(() => (accessor as () => unknown)());
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
      const root = getRootForm() as Record<string, unknown> | undefined;
      if (root && prop in root) return true;
      return prop in getRootFormValue();
    },
    // Whole-object enumeration needs every key, so it reads the eager value and
    // subscribes to all fields — intentional for spread / Object.keys / stringify.
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
