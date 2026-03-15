import { Directive, ElementRef, inject, afterNextRender, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

const DOCS_ADAPTER_NAMES = new Set(['material', 'bootstrap', 'primeng', 'ionic', 'custom']);

/**
 * Intercepts clicks on internal links within ng-doc content and navigates
 * with the correct adapter-prefixed URL.
 *
 * After SSR hydration, `RouterLink` directives are not fully initialised —
 * their internal `urlTree` is null, causing clicks to navigate to wrong pages.
 * This directive catches clicks on any `<a>` with an internal `href` (starting
 * with `/`) and performs programmatic navigation via `router.navigateByUrl()`.
 *
 * External links, anchor links (#), and links that already have an adapter
 * prefix are left untouched.
 */
@Directive({
  selector: 'ng-doc-root[adapterLinkInterceptor]',
})
export class AdapterLinkInterceptorDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    afterNextRender(() => {
      // Must bind on document at capture phase to fire BEFORE Angular's RouterLink
      // event delegation (which also uses document-level capture).
      this.doc.addEventListener('click', (e: MouseEvent) => this.handleClick(e), true);
    });
  }

  private handleClick(e: MouseEvent): void {
    // Don't interfere with modified clicks (new tab, etc.)
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const target = e.target as HTMLElement;

    // Only intercept links within our ng-doc-root element
    if (!this.el.nativeElement.contains(target)) return;

    const anchor = target.closest('a') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('/') || href.startsWith('//')) return;

    // Skip links that already have an adapter prefix
    const firstSegment = href.split('/')[1];
    if (DOCS_ADAPTER_NAMES.has(firstSegment)) return;

    // Skip anchor-only links
    if (href.startsWith('/#')) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const adapter = this.currentAdapter();
    void this.router.navigateByUrl(`/${adapter}${href}`);
  }

  private currentAdapter(): string {
    const pathname = this.doc.location?.pathname ?? '/';
    const seg = pathname.split('/')[1];
    return DOCS_ADAPTER_NAMES.has(seg) ? seg : 'material';
  }
}
