import { Directive, ElementRef, inject, afterNextRender, DestroyRef, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const LINK_SELECTOR = 'a.ng-doc-sidebar-link';
const ACTIVE_CLASS = 'active';

/**
 * Manages sidebar active-link highlighting.
 *
 * ng-doc's `routerLinkActive` doesn't work with adapter-prefixed URLs because
 * sidebar links use bare paths (e.g. `/configuration`) while the browser URL
 * includes the adapter prefix (`/material/configuration`). After SSR hydration
 * `RouterLink` directives are also not fully initialised.
 *
 * This directive compares each sidebar link's `href` against the current URL
 * (stripping the adapter prefix) and toggles the `active` class directly.
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
      // ng-doc re-renders sidebar links after navigation, replacing DOM elements.
      const observer = new MutationObserver(() => this.sync());
      observer.observe(this.el.nativeElement, { childList: true, subtree: true });
      this.destroyRef.onDestroy(() => observer.disconnect());

      requestAnimationFrame(() => this.sync());
    });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => requestAnimationFrame(() => this.sync()));
  }

  private sync(): void {
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
}
