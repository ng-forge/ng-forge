import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { explicitEffect } from 'ngxtension/explicit-effect';

const THEME_STORAGE_KEY = 'ng-forge-docs-theme';
export type ThemeType = 'auto' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Current theme: 'auto' | 'light' | 'dark' */
  readonly theme = signal<ThemeType>(this.loadSavedTheme());

  readonly isDark = computed(() => {
    if (!this.isBrowser) return false;
    const t = this.theme();
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  constructor() {
    if (!this.isBrowser) return;

    // DOM attribute IS a reflection of theme
    explicitEffect([this.theme], ([t]) => {
      if (t === 'light') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', t);
      }
    });

    // localStorage IS persisted theme
    explicitEffect([this.theme], ([t]) => {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    });

    // Listen for system theme changes when in auto mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', () => {
      // Force re-evaluation of isDark by re-setting the same value
      this.theme.update((t) => t);
    });
  }

  toggleTheme(): void {
    const current = this.theme();
    const next: ThemeType = current === 'auto' ? 'light' : current === 'light' ? 'dark' : 'auto';
    this.theme.set(next);
    // That's it — effects handle localStorage and DOM
  }

  private loadSavedTheme(): ThemeType {
    if (!this.isBrowser) return 'auto';
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    return 'auto';
  }
}
