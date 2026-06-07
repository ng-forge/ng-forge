import { FormEvent } from '@ng-forge/dynamic-forms/internal';

/** Event dispatched to submit the form (the action behind a `submit` button). */
export class FormSubmitEvent implements FormEvent {
  readonly type = 'submit' as const;
}
