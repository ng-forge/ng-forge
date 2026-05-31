import { FormEvent } from '@ng-forge/dynamic-forms/internal';

export class NextPageEvent implements FormEvent {
  readonly type = 'next-page' as const;
}
