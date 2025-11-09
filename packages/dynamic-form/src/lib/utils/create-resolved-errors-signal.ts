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
      const errorResolvers = currentErrors.map((error: ValidationError) => resolveErrorMessage(error, msgs, injector));

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
 * @internal
 */
function resolveErrorMessage(error: ValidationError, messages: ValidationMessages, injector: Injector): Observable<ResolvedError> {
  // Get custom message for this error kind
  const customMessage = messages[error.kind];

  // Convert DynamicText to Observable
  const messageObservable = customMessage ? dynamicTextToObservable(customMessage, injector) : of(error.message || 'Validation error');

  // Apply parameter interpolation
  return messageObservable.pipe(
    map((msg) => ({
      kind: error.kind,
      message: interpolateParams(msg, error),
    }))
  );
}
