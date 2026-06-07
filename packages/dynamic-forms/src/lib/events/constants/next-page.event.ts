import { FormEvent } from '@ng-forge/dynamic-forms/internal';

/** Event dispatched to advance a paged form to the next page. */
export class NextPageEvent implements FormEvent {
  readonly type = 'next-page' as const;
}
