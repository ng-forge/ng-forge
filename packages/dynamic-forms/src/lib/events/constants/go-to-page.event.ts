import { FormEvent } from '@ng-forge/dynamic-forms/internal';

/**
 * Event dispatched to move a paged form to a specific page.
 *
 * Backward jumps are unconditional. Forward jumps validate every visible page
 * between the current one and the target (the target itself is not validated);
 * if one is invalid, navigation stops on the first invalid page.
 */
export class GoToPageEvent implements FormEvent {
  readonly type = 'go-to-page' as const;

  constructor(
    /** The target page index (0-based) */
    public readonly pageIndex: number,
  ) {}
}
