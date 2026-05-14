import { Injectable, inject, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, Scroll } from '@angular/router';
import { filter, take } from 'rxjs';
import { AdapterName } from '@ng-forge/sandbox-harness';
import { CUSTOM_ONLY_ROUTES } from '../guards/content-redirect.guard';

const DOCS_ADAPTERS = new Set<AdapterName>(['material', 'bootstrap', 'primeng', 'ionic', 'custom']);

function isDocsAdapter(value: string): value is AdapterName {
  return DOCS_ADAPTERS.has(value as AdapterName);
}

@Injectable({ providedIn: 'root' })
export class ActiveAdapterService {
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly adapter = computed<AdapterName>(() => {
    const nav = this.router.lastSuccessfulNavigation();
    const url = nav ? this.router.serializeUrl(nav.finalUrl ?? nav.extractedUrl) : this.router.url;
    const seg = url.split('/')[1];
    return isDocsAdapter(seg) ? seg : 'material';
  });

  readonly adapters: { name: AdapterName; label: string; icon: string }[] = [
    { name: 'material', label: 'Material', icon: 'assets/icons/material.svg' },
    { name: 'bootstrap', label: 'Bootstrap', icon: 'assets/icons/bootstrap.svg' },
    { name: 'primeng', label: 'PrimeNG', icon: 'assets/icons/primeng.webp' },
    { name: 'ionic', label: 'Ionic', icon: 'assets/icons/ionic.svg' },
    { name: 'custom', label: 'Custom', icon: 'assets/icons/custom.svg' },
  ];

  switchTo(name: AdapterName): void {
    if (!DOCS_ADAPTERS.has(name)) return;
    // Parse via UrlTree so query/fragment text doesn't leak into the
    // path comparison (router.url.split('/') would include them).
    const tree = this.router.parseUrl(this.router.url);
    const primarySegments = tree.root.children['primary']?.segments ?? [];
    const currentPath =
      primarySegments
        .slice(1)
        .map((s) => s.path)
        .join('/') || 'getting-started';
    // If switching away from "custom" while on a custom-only page (e.g.
    // building-an-adapter), the redirect guard would bounce us straight
    // back to /custom/<page>. Land on a sensible page on the target adapter
    // instead. The custom-fields recipe is the closest analogue when the
    // origin was the building-an-adapter guide.
    const path = name !== 'custom' && CUSTOM_ONLY_ROUTES.includes(currentPath) ? 'recipes/custom-fields' : currentPath;

    if (!this.isBrowser) {
      void this.router.navigateByUrl(`/${name}/${path}`);
      return;
    }

    // Preserve scroll position only when staying on the same page across
    // adapters. If the target path differs (custom-only fallback above),
    // the saved scrollY would point into a different document — let the
    // router's default scroll-to-top behavior win.
    if (path === currentPath) {
      const scrollY = window.scrollY;
      this.router.events
        .pipe(
          filter((e): e is Scroll => e instanceof Scroll),
          take(1),
        )
        .subscribe(() => {
          requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'instant' }));
        });
    }

    void this.router.navigateByUrl(`/${name}/${path}`);
  }
}
