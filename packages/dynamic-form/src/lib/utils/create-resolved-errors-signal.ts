import { Signal, Injector, inject, computed, untracked } from '@angular/core';
import { FieldTree, ValidationError } from '@angular/forms/signals';
import { derivedFrom } from 'ngxtension/derived-from';
import { combineLatest, of, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
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

  // Lazy initialization to avoid NG0950 errors during component construction
  // derivedFrom will only be created on first access when inputs are available
  let cachedSignal: Signal<ResolvedError[]> | undefined;

  return computed(() => {
    if (!cachedSignal) {
      // Use untracked to avoid NG0602 when creating effect inside computed
      // Pass injector to derivedFrom to use correct injection context
      cachedSignal = untracked(() =>
        derivedFrom(
          { field, messages },
          switchMap(({ field, messages }) => {
            const control = field();
            const errors = control.errors();

            // No errors - return empty array
            if (!errors || errors.length === 0) {
              return of([]);
            }

            // Create observable for each error's resolved message
            const errorResolvers = errors.map((error: ValidationError) => resolveErrorMessage(error, messages, injector));

            // Combine all error message observables into single array emission
            return errorResolvers.length > 0 ? combineLatest(errorResolvers) : of([]);
          }),
          {
            initialValue: [] as ResolvedError[],
            injector,
          }
        )
      ) as Signal<ResolvedError[]>;
    }

    return cachedSignal();
  });
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
