import { FormEvent } from '@ng-forge/dynamic-forms/internal';

export class PreviousPageEvent implements FormEvent {
  readonly type = 'previous-page' as const;
}
