import { Signal } from '@angular/core';
import { FieldTree, submit, TreeValidationResult } from '@angular/forms/signals';
import { catchError, defer, EMPTY, exhaustMap, firstValueFrom, from, isObservable, Observable, tap } from 'rxjs';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { FormSubmitEvent } from '../../events/constants/submit.event';
import { FormConfig } from '@ng-forge/dynamic-forms/internal';
import { RegisteredFieldTypes } from '@ng-forge/dynamic-forms/internal';
import type { InferFormModel } from '@ng-forge/dynamic-forms/internal';
import type { Logger } from '@ng-forge/dynamic-forms/internal';

/**
 * Options for creating a submission handler.
 *
 * @typeParam TFields - Array of registered field types available for this form
 * @typeParam TModel - The form value model type (inferred from TFields by default)
 */
export interface SubmissionHandlerOptions<
  TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TModel extends Record<string, unknown> = InferFormModel<TFields>,
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
 * Reads whether async validators are still resolving, so a skipped submission
 * can say *why* it was skipped rather than reporting a validation failure that
 * has not actually happened yet.
 */
function isPending<TModel extends Record<string, unknown>>(formSignal: Signal<FieldTree<TModel>>): boolean {
  return formSignal()().pending();
}

/**
 * Whether a resolved action result is a `TreeValidationResult` carrying server errors.
 *
 * `SubmissionConfig.action` also permits arbitrary success payloads (an Observable
 * action is typically an HTTP call resolving to a response body), so anything that
 * is not shaped like one-or-many `ValidationError` is reported to `submit()` as
 * success rather than being misread as a validation failure.
 */
function isTreeValidationErrors(result: unknown): result is TreeValidationResult {
  const isError = (v: unknown): boolean => typeof v === 'object' && v !== null && 'kind' in v;
  return Array.isArray(result) ? result.every(isError) && result.length > 0 : isError(result);
}

/**
 * Wraps a submission action to handle both Promise and Observable returns.
 * Converts Observables to Promises for compatibility with Angular Signal Forms' submit().
 *
 * The resolved value is handed back to `submit()` so that an action returning
 * `TreeValidationResult` has its server errors applied to the form.
 *
 * @param action - The submission action function
 * @returns A wrapped function that returns a Promise
 */
function wrapSubmissionAction<TModel extends Record<string, unknown>>(
  action: (formTree: FieldTree<TModel>) => unknown,
): (formTree: FieldTree<TModel>) => Promise<TreeValidationResult> {
  return async (formTree: FieldTree<TModel>): Promise<TreeValidationResult> => {
    const result = action(formTree);
    // If the action returns an Observable, take its first emission
    const resolved = isObservable(result) ? await firstValueFrom(result) : await Promise.resolve(result);

    return isTreeValidationErrors(resolved) ? resolved : undefined;
  };
}

/**
 * Creates an Observable that handles form submission with optional submission action.
 *
 * @param options - Configuration options for the submission handler
 * @returns Observable that processes submissions (emits when submission completes)
 */
export function createSubmissionHandler<
  TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TModel extends Record<string, unknown> = InferFormModel<TFields>,
>(options: SubmissionHandlerOptions<TFields, TModel>): Observable<unknown> {
  const { eventBus, configSignal, formSignal, validSignal, logger } = options;

  // exhaustMap ensures first-submit-wins: a second submit event while the first
  // is in-flight is silently dropped rather than cancelling the running Promise.
  // switchMap would unsubscribe the Observable wrapper but cannot cancel the
  // underlying Promise, causing both side effects to execute.
  return eventBus.on<FormSubmitEvent>('submit').pipe(
    exhaustMap((event) => {
      // Taking the event is reported before anything else: a caller waiting on a
      // reply distinguishes "dropped by exhaustMap" from "running" by whether
      // this ran during its synchronous dispatch.
      const reply = event.reply;
      reply?.accept();

      const submissionConfig = configSignal().submission;

      // If no submission action is configured, let the submitted output handle it
      // This maintains backward compatibility for users handling submission manually
      if (!submissionConfig?.action) {
        reply?.settle(validSignal() ? { status: 'dispatched' } : { status: 'validation-failed' });
        return EMPTY;
      }

      // Guard: match the (submitted) output's safety contract — reject submission
      // when the form is invalid or has pending async validators.
      if (!validSignal()) {
        logger.debug('Submission action skipped: form is not valid (invalid or pending async validators)');
        reply?.settle(isPending(formSignal) ? { status: 'pending-validation' } : { status: 'validation-failed' });
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
      // `defer` so the form tree is read when the inner observable is subscribed,
      // keeping the post-submit error read on the same tree the action ran against.
      return defer(() => {
        const formTree = formSignal();

        return from(submit(formTree, wrappedAction)).pipe(
          // `submit()` resolves the same way whether the action succeeded or came
          // back with server errors — it applies them to the form rather than
          // rejecting — so the form's own errors are what separate the two.
          tap(() => {
            // Server errors land on the fields they belong to, so the whole-tree
            // summary is what distinguishes a rejected submission from a clean one.
            reply?.settle(formTree().errorSummary().length ? { status: 'server-errors' } : { status: 'success' });
          }),
          catchError((error: unknown) => {
            logger.error('Submission action failed:', error);
            reply?.settle({ status: 'action-failed', error });
            return EMPTY;
          }),
        );
      });
    }),
  );
}
