import { Signal } from '@angular/core';
import { submit } from '@angular/forms/signals';
import { EMPTY, firstValueFrom, from, isObservable, Observable, switchMap } from 'rxjs';
import { EventBus } from '../../events/event.bus';
import { SubmitEvent } from '../../events/constants/submit.event';
import { FormConfig } from '../../models/form-config';
import { RegisteredFieldTypes } from '../../models/registry/field-registry';

/**
 * Options for creating a submission handler.
 */
export interface SubmissionHandlerOptions<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]> {
  /** Event bus instance for listening to submit events */
  eventBus: EventBus;
  /** Signal containing the form configuration */
  configSignal: Signal<FormConfig<TFields>>;
  /** Signal containing the form instance. Type is parameterized to support different form value shapes. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- FieldTree type requires dynamic form model type
  formSignal: Signal<any>;
}

/**
 * Wraps a submission action to handle both Promise and Observable returns.
 * Converts Observables to Promises for compatibility with Angular Signal Forms' submit().
 *
 * @param action - The submission action function
 * @returns A wrapped function that always returns a Promise
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Form tree type is dynamic, action signatures vary
function wrapSubmissionAction(action: (formTree: any) => any): (formTree: any) => Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (formTree: any): Promise<any> => {
    const result = action(formTree);
    // If the action returns an Observable, convert it to a Promise
    if (isObservable(result)) {
      return firstValueFrom(result);
    }
    return result;
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
export function createSubmissionHandler<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[]>(
  options: SubmissionHandlerOptions<TFields>,
): Observable<unknown> {
  const { eventBus, configSignal, formSignal } = options;

  return eventBus.on<SubmitEvent>('submit').pipe(
    switchMap(() => {
      const submissionConfig = configSignal().submission;

      // If no submission action is configured, let the submitted output handle it
      // This maintains backward compatibility for users handling submission manually
      if (!submissionConfig?.action) {
        return EMPTY;
      }

      const wrappedAction = wrapSubmissionAction(submissionConfig.action);

      // Use Angular Signal Forms' native submit() function
      // This automatically:
      // - Sets form.submitting() to true during execution
      // - Applies server errors to form fields on completion
      // - Sets form.submitting() to false when done
      return from(submit(formSignal(), wrappedAction));
    }),
  );
}
