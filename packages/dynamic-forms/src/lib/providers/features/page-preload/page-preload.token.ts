import { InjectionToken } from '@angular/core';

/**
 * Global default for how many pages on each side of the current page a paged
 * form mounts during idle time (the "preload window").
 *
 * A window of `1` (the default) renders the current page directly and mounts its
 * immediate neighbours (±1) on idle, so sequential navigation is flicker-free while
 * distant pages stay unmounted. Larger windows pre-warm more pages (useful for
 * jump navigation) at the cost of more initial DOM + change detection; `0`
 * mounts only the current page.
 *
 * @internal
 */
export const PAGE_PRELOAD_WINDOW = new InjectionToken<number>('PAGE_PRELOAD_WINDOW', {
  providedIn: 'root',
  factory: () => 1,
});
