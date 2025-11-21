import { FormEvent } from '../interfaces/form-event';

export class NextPageEvent implements FormEvent {
  readonly type = 'next-page' as const;
}
