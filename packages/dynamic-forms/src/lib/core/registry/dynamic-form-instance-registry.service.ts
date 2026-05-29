import { computed, inject, Injectable, PLATFORM_ID, Signal, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const AUTO_ID_PREFIX = 'df-';

/**
 * Root-singleton tracking mounted DynamicForm host elements, driving auto-prefixing.
 *
 * Counts only forms that are actually RENDERED (not `display:none`), so a cached
 * but hidden page — e.g. ionic's `ion-router-outlet` keeps the previous page in
 * the DOM for swipe-back — does not inflate the count and wrongly prefix a lone
 * visible form. Browsers re-evaluate visibility via each form's `ResizeObserver`
 * (a host box collapses to 0 on `display:none` and restores when shown), which
 * calls {@link refreshVisibility}. SSR has no layout, so it falls back to
 * counting all registered forms.
 *
 * Slots are recycled (lowest free `df-N`) so ids stay compact across navigation.
 */
@Injectable({ providedIn: 'root' })
export class DynamicFormInstanceRegistry {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly hosts = new Map<number, HTMLElement>();
  private readonly _revision = signal(0);

  /** True while more than one VISIBLE form is mounted — the trigger for auto-prefixing. */
  readonly multiplePresent: Signal<boolean> = computed(() => {
    this._revision();
    let visible = 0;
    for (const host of this.hosts.values()) {
      if (this.isRendered(host)) {
        visible += 1;
        if (visible > 1) return true;
      }
    }
    return false;
  });

  /** Claims the lowest free slot for `host`; the returned id is stable for its lifetime. */
  register(host: HTMLElement): string {
    let slot = 1;
    while (this.hosts.has(slot)) slot++;
    this.hosts.set(slot, host);
    this._revision.update((r) => r + 1);
    return `${AUTO_ID_PREFIX}${slot}`;
  }

  unregister(id: string): void {
    this.hosts.delete(Number(id.slice(AUTO_ID_PREFIX.length)));
    this._revision.update((r) => r + 1);
  }

  /** Re-evaluate the visible-form count (a host was shown/hidden without (un)mounting). */
  refreshVisibility(): void {
    this._revision.update((r) => r + 1);
  }

  private isRendered(host: HTMLElement): boolean {
    if (!this.isBrowser) return true; // SSR: no layout to measure — count all registered.
    if (!host.isConnected) return false;
    if (typeof host.checkVisibility === 'function') return host.checkVisibility();
    const rect = host.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
  }
}
