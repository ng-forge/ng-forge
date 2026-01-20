import { isSignal, isWritableSignal, Signal, WritableSignal } from '@angular/core';

/**
 * Type guard to check if a value is an array of Signals.
 *
 * @param value - The value to check
 * @returns True if value is an array where every element is a Signal
 *
 * @example
 * ```typescript
 * if (isSignalArray(value)) {
 *   // value is typed as readonly Signal<unknown>[]
 *   const observables = value.map(s => toObservable(s));
 * }
 * ```
 *
 * @public
 */
export function isSignalArray(value: unknown): value is readonly Signal<unknown>[] {
  return Array.isArray(value) && value.every((item) => isSignal(item));
}

/**
 * Type guard to check if a value is a record (object) of Signals.
 *
 * @param value - The value to check
 * @returns True if value is a non-null object where every value is a Signal
 *
 * @example
 * ```typescript
 * if (isSignalRecord(value)) {
 *   // value is typed as Record<string, Signal<unknown>>
 *   const keys = Object.keys(value);
 *   const observables = keys.map(key => toObservable(value[key]));
 * }
 * ```
 *
 * @public
 */
export function isSignalRecord(value: unknown): value is Record<string, Signal<unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.values(value).every((item) => isSignal(item));
}

/**
 * Type guard to check if a value is an array of WritableSignals.
 *
 * @param value - The value to check
 * @returns True if value is an array where every element is a WritableSignal
 *
 * @public
 */
export function isWritableSignalArray(value: unknown): value is readonly WritableSignal<unknown>[] {
  return Array.isArray(value) && value.every((item) => isWritableSignal(item));
}

/**
 * Type guard to check if a value is a record (object) of WritableSignals.
 *
 * @param value - The value to check
 * @returns True if value is a non-null object where every value is a WritableSignal
 *
 * @public
 */
export function isWritableSignalRecord(value: unknown): value is Record<string, WritableSignal<unknown>> {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value) && Object.values(value).every((item) => isWritableSignal(item))
  );
}

// Re-export Angular's built-in signal type guards for convenience
export { isSignal, isWritableSignal } from '@angular/core';
