import { inject, Injector, isSignal, Pipe, PipeTransform } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { isObservable, Observable, of } from 'rxjs';
import { DynamicText } from '../../models/types/dynamic-text';

/**
 * Pipe that handles dynamic text resolution with support for static strings,
 * Observables, and Signals.
 *
 * Supports:
 * - Static strings (pass-through)
 * - Observables (subscribed internally)
 * - Signals (converted to Observable using toObservable for reactivity)
 *
 * @example
 * ```html
 * <!-- Static string -->
 * {{ 'Hello World' | dynamicText | async }}
 *
 * <!-- Observable -->
 * {{ transloco.selectTranslate('key') | dynamicText | async }}
 *
 * <!-- Signal -->
 * {{ myTextSignal | dynamicText | async }}
 * ```
 *
 * @public
 */
@Pipe({
  name: 'dynamicText',
  standalone: true,
})
export class DynamicTextPipe implements PipeTransform {
  private readonly injector = inject(Injector);

  /**
   * Transforms dynamic text input into a resolved string value
   *
   * @param value - The dynamic text value to resolve
   * @returns The resolved string value as an Observable
   */
  transform(value: DynamicText | undefined): Observable<string> {
    if (isObservable(value)) {
      return value;
    }

    if (isSignal(value)) {
      return toObservable(value, { injector: this.injector });
    }

    return of(value || '');
  }
}
