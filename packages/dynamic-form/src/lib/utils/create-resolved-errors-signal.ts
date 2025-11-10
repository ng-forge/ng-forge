import { computed, inject, Injector, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FieldTree, ValidationError } from '@angular/forms/signals';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ValidationMessages } from '../models/validation-types';
import { dynamicTextToObservable } from './dynamic-text-to-observable';
import { interpolateParams } from './interpolate-params';

/**
 * Resolved validation error with interpolated message
 */
export interface ResolvedError {
  kind: string;
  message: string;
}

/**
 * Factory function that creates a signal of resolved validation errors
 * Handles async resolution of DynamicText validation messages
 *
 * @param field - Signal containing FieldTree
 * @param validationMessages - Signal containing custom validation messages
 * @param injector - Optional injector for DynamicText resolution
 * @returns Signal<ResolvedError[]> - Reactively resolved error messages
 *
 * @example
 * ```typescript
 * readonly resolvedErrors = createResolvedErrorsSignal(
 *   this.field,
 *   this.validationMessages
 * );
 * ```
 */
export function createResolvedErrorsSignal<T>(
  field: Signal<FieldTree<T>>,
  validationMessages: Signal<ValidationMessages | undefined>,
  injector = inject(Injector)
): Signal<ResolvedError[]> {
  // Ensure validationMessages is never undefined (mappers pass {} if not defined)
  const messages = computed(() => validationMessages() ?? {});

  // Create a computed signal that reads the actual errors from the field
  // This ensures the signal tracks changes to field().errors(), not just the field reference
  const errors = computed(() => {
    const control = field()();
    return control.errors();
  });

  // Convert signals to observables using toObservable with injector
  const errors$ = toObservable(errors, { injector });
  const messages$ = toObservable(messages, { injector });

  // Combine observables and process errors
  const resolvedErrors$ = combineLatest([errors$, messages$]).pipe(
    switchMap(([currentErrors, msgs]) => {
      // No errors - return empty array
      if (!currentErrors || currentErrors.length === 0) {
        return of([]);
      }

      // Create observable for each error's resolved message
      // Filter out errors without configured messages and log warnings
      const errorResolvers = currentErrors
        .filter((error: ValidationError) => {
          const hasMessage = !!msgs[error.kind];
          if (!hasMessage) {
            console.warn(
              `[DynamicForm] No validation message configured for error kind "${error.kind}". ` +
                `Please add a message to the field's validationMessages property. ` +
                `This error will not be displayed to the user.`
            );
          }
          return hasMessage;
        })
        .map((error: ValidationError) => resolveErrorMessage(error, msgs, injector));

      // Combine all error message observables into single array emission
      return errorResolvers.length > 0 ? combineLatest(errorResolvers) : of([]);
    })
  );

  // Convert observable back to signal using toSignal with injector
  // toSignal properly handles the injection context and manages subscriptions
  return toSignal(resolvedErrors$, { initialValue: [] as ResolvedError[], injector });
}

/**
 * Resolves a single error message from DynamicText sources
 *
 * IMPORTANT: This function assumes the error kind has a configured message.
 * Errors without messages should be filtered out before calling this function.
 *
 * @internal
 */
function resolveErrorMessage(error: ValidationError, messages: ValidationMessages, injector: Injector): Observable<ResolvedError> {
  // Get configured message for this error kind (guaranteed to exist by filter above)
  const customMessage = messages[error.kind];

  // Convert DynamicText to Observable (supports string, Observable, Signal)
  const messageObservable = dynamicTextToObservable(customMessage, injector);

  // Apply parameter interpolation to support {{param}} syntax
  return messageObservable.pipe(
    map((msg) => ({
      kind: error.kind,
      message: interpolateParams(msg, error),
    }))
  );
}
