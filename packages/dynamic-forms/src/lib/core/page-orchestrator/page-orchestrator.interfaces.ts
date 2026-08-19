/** Navigation state of a paged form, as emitted by `PagerStateEvent`. */
export interface PagerState {
  /** Current page index (0-based) */
  currentPageIndex: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether the current page is the first visible page */
  isFirstPage: boolean;
  /** Whether the current page is the last visible page */
  isLastPage: boolean;
}

/** Result of a navigation attempt */
export interface NavigationResult {
  /** Whether the navigation was successful */
  success: boolean;
  /** The new page index after navigation */
  newPageIndex: number;
  /** Error message if navigation failed */
  error?: string;
}
