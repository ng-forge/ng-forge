import { FormEvent } from '@ng-forge/dynamic-forms/internal';
import type { SubmissionReply } from '../../utils/submission-handler/submission-outcome';

/**
 * Event dispatched to submit the form (the action behind a `submit` button).
 *
 * A caller that needs to know how the submission ended passes a
 * {@link SubmissionReply}; the submission handler reports back through it. A
 * button click passes nothing and stays fire-and-forget, as before.
 */
export class FormSubmitEvent implements FormEvent {
  readonly type = 'submit' as const;

  constructor(readonly reply?: SubmissionReply) {}
}
