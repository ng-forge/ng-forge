import { inject, Injectable, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { explicitEffect } from 'ngxtension/explicit-effect';

@Injectable({ providedIn: 'root' })
export class PackageManagerService {
  private static readonly STORAGE_KEY = 'ng-forge-package-manager';

  readonly pm: WritableSignal<'npm' | 'pnpm' | 'yarn'>;

  constructor() {
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    const saved = isBrowser ? (localStorage.getItem(PackageManagerService.STORAGE_KEY) as 'npm' | 'pnpm' | 'yarn' | null) : null;
    this.pm = signal(saved ?? 'pnpm');
    if (isBrowser) {
      explicitEffect([this.pm], ([value]) => {
        localStorage.setItem(PackageManagerService.STORAGE_KEY, value);
      });
    }
  }
}
