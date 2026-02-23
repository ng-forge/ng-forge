import { Signal } from '@angular/core';
import { FieldTree, submit } from '@angular/forms/signals';
import { catchError, EMPTY, exhaustMap, firstValueFrom, from, isObservable, Observable } from 'rxjs';
import { EventBus } from '../../events/event.bus';
import { SubmitEvent } from '../../events/constants/submit.event';
import { FormConfig } from '../../models/form-config';
import { RegisteredFieldTypes } from '../../models/registry/field-registry';
import type { InferFormValue } from '../../models/types/form-value-inference';
import type { Logger } from '../../providers/features/logger/logger.interface';

/**
 * Options for creating a submission handler.
 *
 * @typeParam TFields - Array of registered field types available for this form
 * @typeParam TModel - The form value model type (inferred from TFields by default)
 */
export interface SubmissionHandlerOptions<
  TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TModel extends Record<string, unknown> = InferFormValue<TFields> & Record<string, unknown>,
> {
  /** Event bus instance for listening to submit events */
  eventBus: EventBus;
  /** Signal containing the form configuration */
  configSignal: Signal<FormConfig<TFields>>;
  /** Signal containing the form instance */
  formSignal: Signal<FieldTree<TModel>>;
  /** Signal indicating whether the form is currently valid */
  validSignal: Signal<boolean>;
  /** Logger instance for consistent error reporting */
  logger: Logger;
}

/**
 * Wraps a submission action to handle both Promise and Observable returns.
 * Converts Observables to Promises for compatibility with Angular Signal Forms' submit().
 *
 * Errors are NOT caught here — they propagate so that submit() can reject its Promise,
 * allowing the caller's catchError to log and keep the submission stream alive.
 *
 * @param action - The submission action function
 * @returns A wrapped function that returns a Promise
 */
function wrapSubmissionAction<TModel extends Record<string, unknown>>(
  action: (formTree: FieldTree<TModel>) => unknown,
): (formTree: FieldTree<TModel>) => Promise<void> {
  return async (formTree: FieldTree<TModel>): Promise<void> => {
    const result = action(formTree);
    // If the action returns an Observable, convert it to a Promise
    if (isObservable(result)) {
      await firstValueFrom(result);
      return;
    }
    await Promise.resolve(result);
  };
}

/**
 * Creates an Observable that handles form submission with optional submission action.
 *
 * This utility encapsulates the submission handling logic:
 * - Listens for submit events from the event bus
 * - If a submission.action is configured, wraps it and uses Angular Signal Forms' submit()
 * - Handles both Promise and Observable returns from the action
 * - Uses exhaustMap to ignore new submissions while one is in-flight (first-submit-wins)
 *
 * The returned Observable should be subscribed to with takeUntilDestroyed() in the component.
 *
 * @param options - Configuration options for the submission handler
 * @returns Observable that processes submissions (emits when submission completes)
 *
 * @example
 * ```typescript
 * // In component constructor
 * createSubmissionHandler({
 *   eventBus: this.eventBus,
 *   configSignal: this.config,
 *   formSignal: this.form,
 * })
 *   .pipe(takeUntilDestroyed())
 *   .subscribe();
 * ```
 */
export function createSubmissionHandler<
  TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TModel extends Record<string, unknown> = InferFormValue<TFields> & Record<string, unknown>,
>(options: SubmissionHandlerOptions<TFields, TModel>): Observable<unknown> {
  const { eventBus, configSignal, formSignal, validSignal, logger } = options;

  // exhaustMap ensures first-submit-wins: a second submit event while the first
  // is in-flight is silently dropped rather than cancelling the running Promise.
  // switchMap would unsubscribe the Observable wrapper but cannot cancel the
  // underlying Promise, causing both side effects to execute.
  return eventBus.on<SubmitEvent>('submit').pipe(
    exhaustMap(() => {
      const submissionConfig = configSignal().submission;

      // If no submission action is configured, let the submitted output handle it
      // This maintains backward compatibility for users handling submission manually
      if (!submissionConfig?.action) {
        return EMPTY;
      }

      // Guard: match the (submitted) output's safety contract — reject submission
      // when the form is invalid or has pending async validators.
      if (!validSignal()) {
        logger.debug('Submission action skipped: form is not valid (invalid or pending async validators)');
        return EMPTY;
      }

      // Type assertion needed: submission.action accepts the form tree but its signature
      // is defined broadly in FormConfig. The actual runtime type is FieldTree<TModel>.
      const wrappedAction = wrapSubmissionAction<TModel>(submissionConfig.action as (formTree: FieldTree<TModel>) => unknown);

      // Use Angular Signal Forms' native submit() function
      // This automatically:
      // - Sets form.submitting() to true during execution
      // - Applies server errors to form fields on completion
      // - Sets form.submitting() to false when done
      // catchError keeps the exhaustMap stream alive after action failure —
      // without it, an unhandled error would terminate all future submissions.
      return from(submit(formSignal(), wrappedAction)).pipe(
        catchError((error: unknown) => {
          logger.error('Submission action failed:', error);
          return EMPTY;
        }),
      );
    }),
  );
}
