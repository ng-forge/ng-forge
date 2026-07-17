import { inject, Injector, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { DynamicText } from '../../models/types/dynamic-text';
import { dynamicTextToObservable } from '../../utils/dynamic-text-to-observable';

/**
 * Pipe that handles dynamic text resolution with support for static strings,
 * Observables, and Signals.
 */
@Pipe({
  name: 'dynamicText',
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
    // Normalize null to undefined so it resolves to an empty string
    return dynamicTextToObservable(value ?? undefined, this.injector);
  }
}
