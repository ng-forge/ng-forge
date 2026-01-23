import { computed, inject, Injector, signal, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FieldTree, ValidationError } from '@angular/forms/signals';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ValidationMessages } from '@ng-forge/dynamic-forms';
import { dynamicTextToObservable } from '@ng-forge/dynamic-forms';
import { interpolateParams } from '@ng-forge/dynamic-forms';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms';
import type { Logger } from '@ng-forge/dynamic-forms';

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
 * @param validationMessages - Signal containing custom field-level validation messages
 * @param defaultValidationMessages - Signal containing default validation messages (fallback)
 * @param injector - Optional injector for DynamicText resolution
 * @returns Signal<ResolvedError[]> - Reactively resolved error messages
 *
 * @example
 * ```typescript
 * readonly resolvedErrors = createResolvedErrorsSignal(
 *   this.field,
 *   this.validationMessages,
 *   this.defaultValidationMessages
 * );
 * ```
 */
export function createResolvedErrorsSignal<T>(
  field: Signal<FieldTree<T>>,
  validationMessages: Signal<ValidationMessages | undefined>,
  defaultValidationMessages: Signal<ValidationMessages | undefined> = signal(undefined),
  injector = inject(Injector),
): Signal<ResolvedError[]> {
  // Get logger from injector
  const logger = injector.get(DynamicFormLogger);

  // Ensure validationMessages is never undefined (mappers pass {} if not defined)
  const messages = computed(() => validationMessages() ?? {});
  const defaultMessages = computed(() => defaultValidationMessages() ?? {});

  // Create a computed signal that reads the actual errors from the field
  // This ensures the signal tracks changes to field().errors(), not just the field reference
  const errors = computed(() => {
    const control = field()();
    return control.errors();
  });

  // Convert signals to observables using toObservable with injector
  const errors$ = toObservable(errors, { injector });
  const messages$ = toObservable(messages, { injector });
  const defaultMessages$ = toObservable(defaultMessages, { injector });

  // Combine observables and process errors
  const resolvedErrors$ = combineLatest([errors$, messages$, defaultMessages$]).pipe(
    switchMap(([currentErrors, msgs, defaultMsgs]) => {
      // No errors - return empty array
      if (!currentErrors || currentErrors.length === 0) {
        return of([]);
      }

      // Create observable for each error's resolved message
      const errorResolvers = currentErrors.map((error: ValidationError) => resolveErrorMessage(error, msgs, defaultMsgs, injector, logger));

      // Combine all error message observables into single array emission, filtering out nulls
      return errorResolvers.length > 0
        ? combineLatest(errorResolvers).pipe(map((errors) => errors.filter((e): e is ResolvedError => e !== null)))
        : of([]);
    }),
  );

  // Convert observable back to signal using toSignal with injector
  // toSignal properly handles the injection context and manages subscriptions
  return toSignal(resolvedErrors$, { initialValue: [] as ResolvedError[], injector });
}

/**
 * Resolves a single error message from DynamicText sources with fallback logic
 * Priority: field-level message → default message → error.message → no message (logs warning)
 *
 * The error.message fallback enables schema validation libraries (Zod, Valibot, etc.)
 * to provide their own messages without requiring explicit validationMessages configuration.
 * Users who want translations can still override by configuring validationMessages.
 *
 * @internal
 */
function resolveErrorMessage(
  error: ValidationError,
  fieldMessages: ValidationMessages,
  defaultMessages: ValidationMessages,
  injector: Injector,
  logger: Logger,
): Observable<ResolvedError | null> {
  // Check for field-level custom message first
  const fieldMessage = fieldMessages[error.kind];

  // Fall back to default message if no field-level message exists
  const defaultMessage = defaultMessages[error.kind];

  // Determine which message to use: field-level → default → error.message (from schema validators)
  const messageToUse = fieldMessage ?? defaultMessage ?? error.message;

  // If no message found, log warning and return null (will be filtered out)
  if (!messageToUse) {
    logger.warn(
      `No validation message found for error kind "${error.kind}". ` +
        `Please provide a message via field-level validationMessages or form-level defaultValidationMessages.`,
    );
    return of(null);
  }

  // If using error.message directly (from schema validators), wrap in of() instead of dynamicTextToObservable
  // error.message is always a plain string, not DynamicText
  const isSchemaMessage = fieldMessage === undefined && defaultMessage === undefined;
  const messageObservable = isSchemaMessage
    ? of(messageToUse as string) // error.message is always string
    : dynamicTextToObservable(messageToUse, injector);

  // Apply parameter interpolation to support {{param}} syntax
  return messageObservable.pipe(
    map((msg) => ({
      kind: error.kind,
      message: interpolateParams(msg, error),
    })),
  );
}
