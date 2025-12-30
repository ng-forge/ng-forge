import { Injector, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';

/**
 * Default debounce duration in milliseconds.
 */
export const DEFAULT_DEBOUNCE_MS = 500;

/**
 * Creates a debounced effect that triggers a callback after a signal's value
 * has stabilized for the specified duration.
 *
 * Uses Angular's `toObservable` and `toSignal` with RxJS `debounceTime` for proper debouncing.
 * This approach is cleaner than manual setTimeout management and integrates
 * well with Angular's signal-based reactivity.
 *
 * @param source - The source signal to watch for changes
 * @param callback - Function to call with the debounced value
 * @param options - Configuration options
 * @param options.ms - Debounce duration in milliseconds (default: 500)
 * @param options.injector - Angular injector for the effect context
 *
 * @returns A signal that emits the debounced value (can be ignored if only side effects are needed)
 *
 * @example
 * ```typescript
 * // In a component or service
 * const searchInput = signal('');
 *
 * createDebouncedEffect(
 *   searchInput,
 *   (value) => console.log('Debounced search:', value),
 *   { ms: 300, injector: this.injector }
 * );
 * ```
 *
 * @public
 */
export function createDebouncedEffect<T>(
  source: Signal<T>,
  callback: (value: T) => void,
  options: { ms?: number; injector: Injector },
): Signal<T | undefined> {
  const { ms = DEFAULT_DEBOUNCE_MS, injector } = options;

  const source$ = toObservable(source, { injector }).pipe(
    debounceTime(ms),
    distinctUntilChanged(),
    tap((value) => callback(value)),
  );

  return toSignal(source$, { injector });
}

/**
 * Creates a debounced signal that emits values from the source signal
 * only after the value has stabilized for the specified duration.
 *
 * Unlike `createDebouncedEffect`, this doesn't execute a side effect callback.
 * Use this when you just need a debounced version of a signal.
 *
 * @param source - The source signal to debounce
 * @param options - Configuration options
 * @param options.ms - Debounce duration in milliseconds (default: 500)
 * @param options.injector - Angular injector for the effect context
 *
 * @returns A signal that emits the debounced value
 *
 * @example
 * ```typescript
 * const input = signal('');
 * const debouncedInput = createDebouncedSignal(input, { ms: 300, injector });
 *
 * effect(() => {
 *   console.log('Debounced value:', debouncedInput());
 * });
 * ```
 *
 * @public
 */
export function createDebouncedSignal<T>(source: Signal<T>, options: { ms?: number; injector: Injector }): Signal<T | undefined> {
  const { ms = DEFAULT_DEBOUNCE_MS, injector } = options;

  const source$ = toObservable(source, { injector }).pipe(debounceTime(ms), distinctUntilChanged());

  return toSignal(source$, { injector });
}
