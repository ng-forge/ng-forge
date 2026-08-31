/**
 * How a submission ended.
 *
 * Dispatching `FormSubmitEvent` is fire-and-forget: the submission pipeline
 * drops a second submission through `exhaustMap`, skips submission entirely when
 * the form is invalid or async validators are still pending, and swallows an
 * asynchronous action failure to keep the stream alive. None of that is visible
 * to the caller, which is fine for a button click — the user is watching the
 * page — and wrong for anything that has to report back, an agent tool call
 * above all.
 *
 * @experimental
 */
export type SubmissionOutcome =
  | { readonly status: 'success' }
  /** No `submission.action` is configured; the `(submitted)` output received the value. */
  | { readonly status: 'dispatched' }
  /** The form was invalid, so nothing was submitted. */
  | { readonly status: 'validation-failed' }
  /** Async validators had not resolved, so submission was skipped. */
  | { readonly status: 'pending-validation' }
  /** The action ran and came back with server-side validation errors. */
  | { readonly status: 'server-errors' }
  /** The action threw or rejected. */
  | { readonly status: 'action-failed'; readonly error: unknown }
  /** Another submission was already in flight and this one was dropped. */
  | { readonly status: 'busy' }
  /** The form went away before the submission settled. */
  | { readonly status: 'cancelled' };

/**
 * The reply channel a caller attaches to `FormSubmitEvent` when it needs to know
 * what happened.
 *
 * `accept()` is called by the submission handler the moment it takes the event.
 * Because the event bus dispatches synchronously, a caller that finds its reply
 * un-accepted once `dispatch()` returns knows the pipeline dropped the
 * submission rather than merely not having finished it yet — which is the only
 * way to tell "busy" apart from "still running".
 *
 * @experimental
 */
export interface SubmissionReply {
  /** Marks the submission as taken by the pipeline. */
  accept(): void;
  /** Reports the final outcome. The first call wins; later calls are ignored. */
  settle(outcome: SubmissionOutcome): void;
}

/** A reply channel plus the promise that resolves with its outcome. */
export interface PendingSubmission {
  readonly reply: SubmissionReply;
  /** True once the pipeline has taken the event. */
  readonly accepted: () => boolean;
  readonly outcome: Promise<SubmissionOutcome>;
  /** Settles as `cancelled` if nothing else has settled yet. */
  cancel(): void;
}

/**
 * Creates a one-shot reply channel for a single submission.
 *
 * @internal
 */
export function createPendingSubmission(): PendingSubmission {
  let settled = false;
  let accepted = false;
  let resolve!: (outcome: SubmissionOutcome) => void;

  const outcome = new Promise<SubmissionOutcome>((resolvePromise) => {
    resolve = resolvePromise;
  });

  const settle = (result: SubmissionOutcome): void => {
    if (settled) return;
    settled = true;
    resolve(result);
  };

  return {
    reply: {
      accept: () => {
        accepted = true;
      },
      settle,
    },
    accepted: () => accepted,
    outcome,
    cancel: () => settle({ status: 'cancelled' }),
  };
}
