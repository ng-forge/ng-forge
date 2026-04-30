import { computed, isSignal, Signal } from '@angular/core';
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
 * @example
 * ```typescript
 * const isHidden = resolveDynamicValue(addon().hidden, false);
 * // template: \@if (isHidden()) { ... }
 * ```
 */
export function resolveDynamicValue<T>(value: DynamicValue<T> | undefined, fallback: T): Signal<T> {
  if (value === undefined) {
    return computed(() => fallback);
  }
  if (isSignal(value)) {
    return value;
  }
  if (isObservable(value)) {
    return toSignal(value, { initialValue: fallback });
  }
  // Static value
  return computed(() => value);
}
