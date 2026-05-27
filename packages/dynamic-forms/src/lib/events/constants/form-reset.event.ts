import { FormEvent } from '../interfaces/form-event';

/** Event dispatched when the form should be reset to its default values. */
export class FormResetEvent implements FormEvent {
  readonly type = 'form-reset' as const;
}
