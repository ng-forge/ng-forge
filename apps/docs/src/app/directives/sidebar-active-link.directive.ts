import { Directive, ElementRef, inject, afterNextRender, DestroyRef, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const LINK_SELECTOR = 'a.ng-doc-sidebar-link';
const ACTIVE_CLASS = 'active';

/**
 * Manages sidebar link navigation and active-state highlighting.
 *
 * ng-doc sidebar links use bare paths (e.g. `/configuration`) but the app uses
 * adapter-prefixed URLs (`/material/configuration`). After SSR hydration the
 * `RouterLink` directives are not fully initialised, causing two issues:
 *
 * 1. `routerLinkActive` never highlights the active link
 * 2. Click navigation resolves to wrong routes (e.g. getting-started instead of
 *    the target page) because RouterLink's internal urlTree lacks the adapter prefix
 *
 * This directive fixes both by:
 * - Intercepting clicks on sidebar links and navigating with the correct
 *   adapter-prefixed URL via `router.navigateByUrl()`
 * - Toggling the `active` CSS class based on URL comparison
 */
@Directive({
  selector: 'ng-doc-sidebar[sidebarActiveLink]',
})
export class SidebarActiveLinkDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    afterNextRender(() => {
      // Intercept sidebar link clicks to navigate with adapter-prefixed URLs.
      this.el.nativeElement.addEventListener('click', (e: MouseEvent) => this.handleClick(e));

      // ng-doc re-renders sidebar links after navigation, replacing DOM elements.
      const observer = new MutationObserver(() => this.syncActiveState());
      observer.observe(this.el.nativeElement, { childList: true, subtree: true });
      this.destroyRef.onDestroy(() => observer.disconnect());

      // Initial sync after hydration.
      requestAnimationFrame(() => this.syncActiveState());
    });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => requestAnimationFrame(() => this.syncActiveState()));
  }

  private handleClick(e: MouseEvent): void {
    const anchor = (e.target as HTMLElement).closest(LINK_SELECTOR) as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('/')) return;

    // Prevent the default RouterLink/browser navigation
    e.preventDefault();
    e.stopPropagation();

    // Navigate with the adapter-prefixed URL
    const adapter = this.currentAdapter();
    void this.router.navigateByUrl(`/${adapter}${href}`);
  }

  private syncActiveState(): void {
    const url = this.router.url || this.doc.location?.pathname || '/';
    const currentPath = url.split(/[?#]/)[0];
    const links: HTMLAnchorElement[] = Array.from(this.el.nativeElement.querySelectorAll(LINK_SELECTOR));

    const segments = currentPath.split('/');
    const pathWithoutAdapter = '/' + segments.slice(2).join('/');

    for (const link of links) {
      const href = link.getAttribute('href');
      if (!href) continue;
      link.classList.toggle(ACTIVE_CLASS, pathWithoutAdapter === href);
    }
  }

  private currentAdapter(): string {
    const pathname = this.doc.location?.pathname ?? '/';
    const seg = pathname.split('/')[1];
    return seg || 'material';
  }
}
