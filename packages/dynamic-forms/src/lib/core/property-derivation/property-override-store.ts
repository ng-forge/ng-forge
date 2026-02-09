import { InjectionToken, signal, Signal, WritableSignal } from '@angular/core';
import { isEqual } from '../../utils/object-utils';

/**
 * Per-field signal store for property overrides.
 *
 * Each field that has property derivations gets a WritableSignal containing
 * a record of property names to their override values. Mappers read from
 * this store reactively — only the specific field's signal is read, so
 * changes to one field's overrides don't cause other fields to recompute.
 *
 * @public
 */
export interface PropertyOverrideStore {
  /**
   * Gets the override signal for a field.
   *
   * Lazily creates a per-field signal on first access. Subsequent calls
   * return the same signal instance.
   *
   * @param fieldKey - The store key (e.g., 'endDate' or 'contacts.0.email')
   * @returns Signal containing the current overrides record
   */
  getOverrides(fieldKey: string): Signal<Record<string, unknown>>;

  /**
   * Sets a single property override for a field.
   *
   * Uses deep equality to skip no-op updates. Setting `undefined` as the value
   * removes the property key from the override record.
   *
   * @param fieldKey - The store key
   * @param targetProperty - The property name (e.g., 'minDate', 'options')
   * @param value - The override value, or undefined to remove
   */
  setOverride(fieldKey: string, targetProperty: string, value: unknown): void;

  /**
   * Registers a field as having property derivations.
   *
   * Called by the orchestrator during collection. Enables the fast-path
   * check in mappers via `hasField()`.
   *
   * @param fieldKey - The store key to register
   */
  registerField(fieldKey: string): void;

  /**
   * Non-reactive check for whether a field has been registered.
   *
   * Uses plain Map.has() — O(1), no signal creation. Used by mappers
   * to skip the computed() wrapper for fields without property derivations.
   *
   * @param fieldKey - The store key (or prefix for array fields)
   * @returns true if the field has property derivation entries
   */
  hasField(fieldKey: string): boolean;

  /**
   * Clears all overrides and registered fields.
   *
   * Prunes the internal Map entirely, releasing all signal references.
   * Called when the form config changes (new collection = reset).
   */
  clear(): void;
}

const EMPTY_OVERRIDES: Record<string, unknown> = Object.freeze({});

/**
 * Creates a new PropertyOverrideStore instance.
 *
 * @returns A fresh PropertyOverrideStore
 *
 * @public
 */
export function createPropertyOverrideStore(): PropertyOverrideStore {
  const store = new Map<string, WritableSignal<Record<string, unknown>>>();
  const registeredFields = new Set<string>();

  function getOrCreateSignal(fieldKey: string): WritableSignal<Record<string, unknown>> {
    let existing = store.get(fieldKey);
    if (!existing) {
      existing = signal(EMPTY_OVERRIDES);
      store.set(fieldKey, existing);
    }
    return existing;
  }

  return {
    getOverrides(fieldKey: string): Signal<Record<string, unknown>> {
      return getOrCreateSignal(fieldKey);
    },

    setOverride(fieldKey: string, targetProperty: string, value: unknown): void {
      const fieldSignal = getOrCreateSignal(fieldKey);
      const current = fieldSignal();

      if (value === undefined) {
        // Remove the property key
        if (!(targetProperty in current)) {
          return; // Already absent, no-op
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [targetProperty]: _, ...rest } = current;
        fieldSignal.set(Object.keys(rest).length === 0 ? EMPTY_OVERRIDES : rest);
      } else {
        // Set or update the property
        const currentValue = current[targetProperty];
        if (isEqual(currentValue, value)) {
          return; // Value unchanged, no-op
        }
        fieldSignal.set({ ...current, [targetProperty]: value });
      }
    },

    registerField(fieldKey: string): void {
      registeredFields.add(fieldKey);
    },

    hasField(fieldKey: string): boolean {
      return registeredFields.has(fieldKey);
    },

    clear(): void {
      store.clear();
      registeredFields.clear();
    },
  };
}

/**
 * Injection token for the PropertyOverrideStore.
 *
 * @public
 */
export const PROPERTY_OVERRIDE_STORE = new InjectionToken<PropertyOverrideStore>('PROPERTY_OVERRIDE_STORE');
