import { isSignal, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { isObservable, Observable, of } from 'rxjs';
import { DynamicText } from '../models/types/dynamic-text';

/**
 * Converts DynamicText (string | Observable | Signal) to Observable<string>
 * Unifies all three types into a consistent Observable stream
 *
 * @param value - The dynamic text value to convert
 * @param injector - Optional injector for signal conversion
 * @returns Observable<string> - The value as an observable stream
 */
export function dynamicTextToObservable(value: DynamicText | undefined, injector?: Injector): Observable<string> {
  if (value === undefined) {
    return of('');
  }

  if (isObservable(value)) {
    return value;
  }

  if (isSignal(value)) {
    return toObservable(value, { injector });
  }

  return of(String(value));
}
