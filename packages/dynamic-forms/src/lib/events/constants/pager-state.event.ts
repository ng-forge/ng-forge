import { FormEvent } from '@ng-forge/dynamic-forms/internal';
import { PagerState } from '../../core/page-orchestrator/page-orchestrator.interfaces';

/**
 * Event emitted whenever the pager state of a paged form changes.
 *
 * Unlike `PageChangeEvent`, which fires only when the active page changed, this
 * fires on any change to the derived state — including when `isFirstPage` /
 * `isLastPage` flip because a page's `hidden` logic toggled and the set of
 * visible pages shifted, with the active page never moving.
 */
export class PagerStateEvent implements FormEvent {
  readonly type = 'pager-state' as const;

  constructor(public state: PagerState) {}
}
