import { Directive, ElementRef, inject, afterNextRender, DestroyRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActiveAdapterService } from '../services/active-adapter.service';

const BREADCRUMB_SELECTOR = 'ng-doc-breadcrumb';
const ADAPTER_CRUMB_CLASS = 'adapter-breadcrumb';

/**
 * Prepends the current adapter name to ng-doc's breadcrumb.
 *
 * ng-doc breadcrumbs show "Category > Page" but don't include the adapter
 * prefix. This directive injects an adapter chip (icon + name) as the
 * first breadcrumb item on navigation and initial render.
 */
@Directive({
  selector: 'ng-doc-root[adapterBreadcrumb]',
})
export class BreadcrumbAdapterDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private readonly activeAdapter = inject(ActiveAdapterService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    // Initial inject after hydration — retry a few times since ng-doc
    // may not have rendered the breadcrumb yet.
    afterNextRender(() => {
      this.retryInject(5);
    });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.retryInject(3));
  }

  private retryInject(attempts: number): void {
    const tryInject = (remaining: number) => {
      if (this.injectAdapter() || remaining <= 0) return;
      requestAnimationFrame(() => tryInject(remaining - 1));
    };
    requestAnimationFrame(() => tryInject(attempts));
  }

  private injectAdapter(): boolean {
    const breadcrumbs: HTMLElement[] = Array.from(this.el.nativeElement.querySelectorAll(BREADCRUMB_SELECTOR));
    if (breadcrumbs.length === 0) return false;

    const adapterInfo = this.activeAdapter.adapters.find((a) => a.name === this.activeAdapter.adapter());
    if (!adapterInfo) return false;

    for (const bc of breadcrumbs) {
      const existing = bc.querySelector(`.${ADAPTER_CRUMB_CLASS}`) as HTMLElement | null;

      if (existing) {
        // Update icon + label
        const icon = existing.querySelector('.adapter-breadcrumb-icon') as HTMLImageElement;
        const label = existing.querySelector('span') as HTMLElement;
        if (icon) {
          icon.src = adapterInfo.icon;
          icon.alt = adapterInfo.label;
        }
        if (label) {
          label.textContent = adapterInfo.label;
        }
      } else {
        // Create adapter chip with icon
        const chip = document.createElement('span');
        chip.className = ADAPTER_CRUMB_CLASS;

        const icon = document.createElement('img');
        icon.src = adapterInfo.icon;
        icon.alt = adapterInfo.label;
        icon.className = 'adapter-breadcrumb-icon';
        icon.width = 16;
        icon.height = 16;
        chip.appendChild(icon);

        const label = document.createElement('span');
        label.textContent = adapterInfo.label;
        chip.appendChild(label);

        const sep = document.createElement('span');
        sep.className = 'adapter-breadcrumb-sep';
        sep.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

        bc.prepend(sep);
        bc.prepend(chip);
      }
    }

    return true;
  }
}
