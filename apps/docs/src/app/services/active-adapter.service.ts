import { Injectable, inject, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, Scroll } from '@angular/router';
import { filter, take } from 'rxjs';
import { AdapterName } from '@ng-forge/sandbox-harness';

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
    const segments = this.router.url.split('/');
    const path = segments.slice(2).join('/') || 'getting-started';

    if (!this.isBrowser) {
      void this.router.navigateByUrl(`/${name}/${path}`);
      return;
    }

    // Preserve scroll position during adapter switch.
    // The router's scrollPositionRestoration fires via the Scroll event, so we wait
    // for it to complete, then restore our saved position in the next animation frame.
    const scrollY = window.scrollY;

    this.router.events
      .pipe(
        filter((e): e is Scroll => e instanceof Scroll),
        take(1),
      )
      .subscribe(() => {
        requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'instant' }));
      });

    void this.router.navigateByUrl(`/${name}/${path}`);
  }
}
