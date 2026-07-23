import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { PAGE_PRELOAD_WINDOW } from './page-preload.token';

/**
 * Configures the global page preload window for paged forms — how many pages on
 * each side of the current page are eagerly mounted.
 *
 * @remarks
 * Paged forms only ever display one page at a time, so mounting every page (the
 * fields, containers, and change-detection of pages the user may never reach)
 * is wasted work: it inflates initial-render time and makes every keystroke pay
 * change detection for off-screen pages. The preload window bounds how much is
 * mounted around the current page. Pages outside the window render a lightweight
 * placeholder and mount the moment navigation brings them inside it.
 *
 * **Precedence:**
 * 1. Per-form `pagePreloadWindow` on `FormOptions` — wins for that form
 * 2. Global `withPagePreload(n)` — baseline default for all forms
 * 3. No feature — token default (`1`, i.e. current page ±1)
 *
 * @param window - Pages to preload on each side of the current page. `0` mounts
 *   only the current page; `1` (default) mounts ±1 for flicker-free sequential
 *   navigation; higher values pre-warm more pages for jump navigation. Negative
 *   values are clamped to `0`.
 * @returns A DynamicFormFeature that configures the global preload window
 *
 * @example
 * ```typescript
 * provideDynamicForm(...withMaterialFields(), withPagePreload(2));
 * ```
 */
export function withPagePreload(window: number): DynamicFormFeature<'page-preload'> {
  const resolved = Math.max(0, Math.floor(window));
  return createFeature('page-preload', [{ provide: PAGE_PRELOAD_WINDOW, useValue: resolved }]);
}
