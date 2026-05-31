import { computed, Injector, isSignal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { isObservable } from 'rxjs';
import { DynamicValue } from '../../models/types/dynamic-value';

/** Normalises a {@link DynamicValue} into a `Signal<T>`. */
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
