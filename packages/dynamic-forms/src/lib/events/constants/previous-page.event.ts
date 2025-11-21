import { FormEvent } from '../interfaces/form-event';

export class PreviousPageEvent implements FormEvent {
  readonly type = 'previous-page' as const;
}
