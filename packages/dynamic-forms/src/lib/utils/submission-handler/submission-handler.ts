import { Signal } from '@angular/core';
import { FieldTree, submit } from '@angular/forms/signals';
import { EMPTY, firstValueFrom, from, isObservable, Observable, switchMap } from 'rxjs';
import { EventBus } from '../../events/event.bus';
import { SubmitEvent } from '../../events/constants/submit.event';
import { FormConfig } from '../../models/form-config';
import { RegisteredFieldTypes } from '../../models/registry/field-registry';
import type { InferFormValue } from '../../models/types/form-value-inference';

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
}

/**
 * Wraps a submission action to handle both Promise and Observable returns.
 * Converts Observables to Promises for compatibility with Angular Signal Forms' submit().
 *
 * The return type uses `void` to match Angular Signal Forms' expected action signature.
 * The actual result from the action is preserved but typed as void since Angular's
 * submit() function handles the result internally.
 *
 * @param action - The submission action function
 * @returns A wrapped function that always returns a Promise
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
 * - Uses switchMap to cancel any in-flight submission when a new one starts
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
  const { eventBus, configSignal, formSignal } = options;

  return eventBus.on<SubmitEvent>('submit').pipe(
    switchMap(() => {
      const submissionConfig = configSignal().submission;

      // If no submission action is configured, let the submitted output handle it
      // This maintains backward compatibility for users handling submission manually
      if (!submissionConfig?.action) {
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
      return from(submit(formSignal(), wrappedAction));
    }),
  );
}
