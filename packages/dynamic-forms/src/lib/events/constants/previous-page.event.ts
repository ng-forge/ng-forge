import { FormEvent } from '@ng-forge/dynamic-forms/internal';

/** Event dispatched to return a paged form to the previous page. */
export class PreviousPageEvent implements FormEvent {
  readonly type = 'previous-page' as const;
}
