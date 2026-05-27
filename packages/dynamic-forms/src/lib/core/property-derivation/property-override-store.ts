import { InjectionToken, signal, Signal, WritableSignal } from '@angular/core';
import { isEqual } from '../../utils/object-utils';

/** Per-field signal store for property overrides. */
export interface PropertyOverrideStore {
  /**
   * Gets the override signal for a field.
   *
   * @param fieldKey - The store key (e.g., 'endDate' or 'contacts.0.email')
   * @returns Signal containing the current overrides record
   */
  getOverrides(fieldKey: string): Signal<Record<string, unknown>>;

  /**
   * Sets a single property override for a field.
   *
   * @param fieldKey - The store key
   * @param targetProperty - The property name (e.g., 'minDate', 'options')
   * @param value - The override value, or undefined to remove
   */
  setOverride(fieldKey: string, targetProperty: string, value: unknown): void;

  /**
   * Registers a field as having property derivations.
   *
   * @param fieldKey - The store key to register
   */
  registerField(fieldKey: string): void;

  /**
   * Non-reactive check for whether a field has been registered.
   *
   * @param fieldKey - The store key (or prefix for array fields)
   * @returns true if the field has property derivation entries
   */
  hasField(fieldKey: string): boolean;

  /** Clears all overrides and registered fields. */
  clear(): void;
}

const EMPTY_OVERRIDES: Record<string, unknown> = Object.freeze({});

/**
 * Creates a new PropertyOverrideStore instance.
 *
 * @returns A fresh PropertyOverrideStore
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

/** Injection token for the PropertyOverrideStore. */
export const PROPERTY_OVERRIDE_STORE = new InjectionToken<PropertyOverrideStore>('PROPERTY_OVERRIDE_STORE');
