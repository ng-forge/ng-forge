import { Injector, isSignal, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, defer, Observable, OperatorFunction } from 'rxjs';

/**
 * Type guard to check if a value is an array of Signals.
 * @internal
 */
function isSignalArray(value: unknown): value is readonly Signal<unknown>[] {
  return Array.isArray(value) && value.every((item) => isSignal(item));
}

/**
 * Type guard to check if a value is a record (object) of Signals.
 * @internal
 */
function isSignalRecord(value: unknown): value is Record<string, Signal<unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.values(value).every((item) => isSignal(item));
}

/**
 * Options for derivedFromDeferred.
 */
export interface DerivedFromDeferredOptions<R> {
  initialValue: R;
  injector: Injector;
}

/**
 * Type helper to extract the value type from a Signal.
 */
type SignalValue<T> = T extends Signal<infer V> ? V : never;

/**
 * Type helper to map an array of Signals to an array of their value types.
 */
type SignalValues<T extends readonly Signal<unknown>[]> = {
  [K in keyof T]: SignalValue<T[K]>;
};

/**
 * Type helper to map an object of Signals to an object of their value types.
 */
type SignalObjectValues<T extends Record<string, Signal<unknown>>> = {
  [K in keyof T]: SignalValue<T[K]>;
};

/**
 * Like derivedFrom from ngxtension, but uses defer() to avoid input availability issues.
 * This ensures toObservable is called at subscription time, not at field initialization.
 *
 * Supports three source types:
 * - Single signal: `derivedFromDeferred(signal, operator, options)`
 * - Array of signals: `derivedFromDeferred([signal1, signal2], operator, options)`
 * - Object of signals: `derivedFromDeferred({a: signal1, b: signal2}, operator, options)`
 *
 * @example
 * ```typescript
 * // Single signal
 * const result = derivedFromDeferred(
 *   mySignal,
 *   pipe(map(v => v * 2)),
 *   { initialValue: 0, injector }
 * );
 *
 * // Array of signals
 * const result = derivedFromDeferred(
 *   [signalA, signalB],
 *   pipe(map(([a, b]) => a + b)),
 *   { initialValue: 0, injector }
 * );
 *
 * // Object of signals
 * const result = derivedFromDeferred(
 *   { x: signalX, y: signalY },
 *   pipe(map(({ x, y }) => x + y)),
 *   { initialValue: 0, injector }
 * );
 * ```
 */

// Overload: Single signal
export function derivedFromDeferred<T, R>(
  source: Signal<T>,
  operator: OperatorFunction<T, R>,
  options: DerivedFromDeferredOptions<R>,
): Signal<R>;

// Overload: Array of signals
export function derivedFromDeferred<T extends readonly Signal<unknown>[], R>(
  sources: [...T],
  operator: OperatorFunction<SignalValues<T>, R>,
  options: DerivedFromDeferredOptions<R>,
): Signal<R>;

// Overload: Object of signals
export function derivedFromDeferred<T extends Record<string, Signal<unknown>>, R>(
  sources: T,
  operator: OperatorFunction<SignalObjectValues<T>, R>,
  options: DerivedFromDeferredOptions<R>,
): Signal<R>;

// Implementation
export function derivedFromDeferred<T, R>(
  source: Signal<T> | Signal<unknown>[] | Record<string, Signal<unknown>>,
  operator: OperatorFunction<T | unknown[] | Record<string, unknown>, R>,
  options: DerivedFromDeferredOptions<R>,
): Signal<R> {
  const deferred$: Observable<R> = defer(() => {
    // Handle single signal
    if (isSignal(source)) {
      return toObservable(source, { injector: options.injector });
    }

    // Handle array of signals
    if (isSignalArray(source)) {
      const observables = source.map((s) => toObservable(s, { injector: options.injector }));
      return combineLatest(observables);
    }

    // Handle object of signals
    if (isSignalRecord(source)) {
      const keys = Object.keys(source);
      const observables = keys.map((key) => toObservable(source[key], { injector: options.injector }));

      return combineLatest(observables, (...values) => {
        const result: Record<string, unknown> = {};
        keys.forEach((key, index) => {
          result[key] = values[index];
        });
        return result;
      });
    }

    // Fallback - should not happen with proper typing
    throw new Error('Invalid source type. Expected a Signal, array of Signals, or object of Signals.');
  }).pipe(operator);

  return toSignal(deferred$, { initialValue: options.initialValue, injector: options.injector });
}
