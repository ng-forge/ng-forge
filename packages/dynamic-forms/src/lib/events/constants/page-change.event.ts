import { FormEvent } from '@ng-forge/dynamic-forms/internal';

/** Event emitted when the active page of a paged form changes. */
export class PageChangeEvent implements FormEvent {
  readonly type = 'page-change' as const;

  constructor(
    /** The current page index (0-based) */
    public readonly currentPageIndex: number,
    /** Total number of pages */
    public readonly totalPages: number,
    /** Previous page index (0-based), undefined if first navigation */
    public readonly previousPageIndex?: number,
  ) {}
}
