import { Injectable, inject, Signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith, take } from 'rxjs';
import { AdapterName, isAdapterName } from '@ng-forge/sandbox-harness';

const DOCS_ADAPTERS: AdapterName[] = ['material', 'bootstrap', 'primeng', 'ionic', 'custom'];

@Injectable({ providedIn: 'root' })
export class ActiveAdapterService {
  private readonly router = inject(Router);

  readonly adapter: Signal<AdapterName> = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const seg = this.router.url.split('/')[1];
        return isAdapterName(seg) && seg !== 'core' ? seg : 'material';
      }),
    ),
    { initialValue: 'material' },
  );

  readonly adapters: { name: AdapterName; label: string; icon: string }[] = [
    { name: 'material', label: 'Material', icon: 'assets/icons/material.svg' },
    { name: 'bootstrap', label: 'Bootstrap', icon: 'assets/icons/bootstrap.svg' },
    { name: 'primeng', label: 'PrimeNG', icon: 'assets/icons/primeng.webp' },
    { name: 'ionic', label: 'Ionic', icon: 'assets/icons/ionic.svg' },
    { name: 'custom', label: 'Custom', icon: 'assets/icons/custom.svg' },
  ];

  switchTo(name: AdapterName): void {
    if (!DOCS_ADAPTERS.includes(name)) return;
    const scrollY = window.scrollY;
    const segments = this.router.url.split('/');
    const path = segments.slice(2).join('/') || 'getting-started';
    void this.router.navigateByUrl(`/${name}/${path}`);
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
