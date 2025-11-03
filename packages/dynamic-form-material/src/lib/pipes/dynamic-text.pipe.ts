import { isSignal, Pipe, PipeTransform } from '@angular/core';
import { isObservable, Observable, of } from 'rxjs';
import { DynamicText } from '@ng-forge/dynamic-form';

/**
 * Pipe that handles dynamic text resolution with support for static strings,
 * Observables, and Signals.
 *
 * Supports:
 * - Static strings (pass-through)
 * - Observables (subscribed internally)
 * - Signals (converted to Observable using toObservable)
 *
 * @example
 * ```html
 * <!-- Static string -->
 * {{ 'Hello World' | dynamicText }}
 *
 * <!-- Observable -->
 * {{ transloco.selectTranslate('key') | dynamicText }}
 *
 * <!-- Signal -->
 * {{ myTextSignal | dynamicText }}
 * ```
 *
 * @public
 */
@Pipe({
  name: 'dynamicText',
  standalone: true,
})
export class DynamicTextPipe implements PipeTransform {
  /**
   * Transforms dynamic text input into a resolved string value
   *
   * @param value - The dynamic text value to resolve
   * @returns The resolved string value
   */
  transform(value: DynamicText | undefined): Observable<string> {
    if (isObservable(value)) {
      return value;
    }

    if (isSignal(value)) {
      return of(value());
    }

    return of(value || '');
  }
}
