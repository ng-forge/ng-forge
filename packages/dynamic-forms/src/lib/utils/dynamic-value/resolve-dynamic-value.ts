import { computed, Injector, isSignal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { isObservable } from 'rxjs';
import { DynamicValue } from '../../models/types/dynamic-value';

/**
 * Normalises a {@link DynamicValue} into a `Signal<T>`.
 *
 * Accepts a static value, a `Signal<T>`, or an `Observable<T>`. The result
 * is a `Signal<T>` that reactively reflects the current value, suitable
 * for direct use in Angular templates.
 *
 * Static values yield a `computed` that always returns the same constant —
 * preferable to wrapping in `signal()` because the computed never causes
 * change-detection invalidation.
 *
 * Pass an `injector` when calling outside an Angular injection context
 * (e.g., from inside a `computed`). `toSignal` needs a `DestroyRef` to
 * unsubscribe — without an injector it falls back to `inject(DestroyRef)`,
 * which throws when called outside injection context.
 *
 * @example
 * ```typescript
 * const isHidden = resolveDynamicValue(addon().hidden, false);
 * // template: \@if (isHidden()) { ... }
 * ```
 */
export function resolveDynamicValue<T>(value: DynamicValue<T> | undefined, fallback: T, injector?: Injector): Signal<T> {
  if (value === undefined) {
    return computed(() => fallback);
  }
  if (isSignal(value)) {
    return value;
  }
  if (isObservable(value)) {
    return toSignal(value, { initialValue: fallback, injector });
  }
  // Static value
  return computed(() => value);
}
