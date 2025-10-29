import { FormEvent } from '../interfaces/form-event';

export class PageChangeEvent implements FormEvent {
  readonly type = 'page-change' as const;
}
