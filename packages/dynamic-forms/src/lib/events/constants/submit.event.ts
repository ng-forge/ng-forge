import { FormEvent } from '../interfaces/form-event';

export class SubmitEvent implements FormEvent {
  readonly type = 'submit' as const;
}
