import { Injectable, inject, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
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
    const scrollY = this.isBrowser ? window.scrollY : 0;
    const segments = this.router.url.split('/');
    const path = segments.slice(2).join('/') || 'getting-started';
    void this.router.navigateByUrl(`/${name}/${path}`);
    if (!this.isBrowser) return;
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        take(1),
      )
      .subscribe(() => {
        requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'instant' }));
      });
  }
}
