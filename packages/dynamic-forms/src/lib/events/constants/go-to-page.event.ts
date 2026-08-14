import { FormEvent } from '@ng-forge/dynamic-forms/internal';

/** Per-dispatch overrides for a page jump. */
export interface PageNavigationOptions {
  /**
   * Whether to apply the forward-jump validity gate.
   *
   * Set `false` to land on the target regardless of earlier pages, which is what
   * restoring a saved session wants. Bounds and hidden-page checks still apply.
   *
   * @default true
   */
  validate?: boolean;
}

/**
 * Event dispatched to move a paged form to a specific page.
 *
 * Backward jumps are unconditional. Forward jumps validate every visible page
 * between the current one and the target (the target itself is not validated);
 * if one is invalid, navigation stops on the first invalid page. Pass
 * `{ validate: false }` to skip that gate and land on the target.
 */
export class GoToPageEvent implements FormEvent {
  readonly type = 'go-to-page' as const;

  constructor(
    /** The target page index (0-based) */
    public readonly pageIndex: number,
    /** Per-dispatch overrides; omit for the default gated behavior. */
    public readonly options?: PageNavigationOptions,
  ) {}
}
