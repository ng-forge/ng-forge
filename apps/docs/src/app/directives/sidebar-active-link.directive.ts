import { Directive, ElementRef, inject, afterNextRender, DestroyRef, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const LINK_SELECTOR = 'a.ng-doc-sidebar-link';
const ACTIVE_CLASS = 'active';

/**
 * Fixes sidebar active-link highlighting on initial page load.
 *
 * ng-doc's sidebar uses `routerLinkActive="active"` on links whose hrefs lack
 * the `/:adapter` prefix (e.g. `/configuration`). After SSR hydration the
 * `RouterLink` directive is not fully initialised, so `routerLinkActive` never
 * fires on the first render. This directive patches the gap by comparing each
 * link's `href` against the current URL and toggling the `active` class.
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

    // After hydration, sync active state using the browser URL (router.url may
    // not be resolved yet). We observe childList mutations because ng-doc may
    // re-render the sidebar after initial hydration.
    afterNextRender(() => {
      const observer = new MutationObserver(() => this.syncFromLocation());
      observer.observe(this.el.nativeElement, { childList: true, subtree: true });
      this.destroyRef.onDestroy(() => observer.disconnect());

      // Initial sync — use requestAnimationFrame to let the router and
      // ng-doc change detection settle after hydration.
      requestAnimationFrame(() => this.syncFromLocation());
    });

    // On SPA navigation, sync using the router URL.
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncLinks(this.router.url));
  }

  private syncFromLocation(): boolean {
    return this.syncLinks(this.doc.location?.pathname ?? '/');
  }

  private syncLinks(url: string): boolean {
    const currentPath = url.split(/[?#]/)[0];
    const links: HTMLAnchorElement[] = Array.from(this.el.nativeElement.querySelectorAll(LINK_SELECTOR));
    if (links.length === 0) return false;

    // Sidebar href: "/configuration", browser URL: "/material/configuration".
    const segments = currentPath.split('/');
    const pathWithoutAdapter = '/' + segments.slice(2).join('/');

    for (const link of links) {
      const href = link.getAttribute('href');
      if (!href) continue;
      link.classList.toggle(ACTIVE_CLASS, pathWithoutAdapter === href);
    }
    return true;
  }
}
