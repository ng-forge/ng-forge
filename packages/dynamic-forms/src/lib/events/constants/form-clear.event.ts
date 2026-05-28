import { FormEvent } from '../interfaces/form-event';

/** Event dispatched when the form should be cleared. */
export class FormClearEvent implements FormEvent {
  readonly type = 'form-clear' as const;
}
