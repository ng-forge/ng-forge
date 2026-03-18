import { afterNextRender, computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { explicitEffect } from 'ngxtension/explicit-effect';

const THEME_STORAGE_KEY = 'ng-forge-docs-theme';
export type ThemeType = 'auto' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Current theme: 'auto' | 'light' | 'dark'.
   * Always starts as 'auto' to match SSR output and prevent hydration mismatches.
   * The saved theme from localStorage is applied post-hydration via afterNextRender.
   * The inline <script> in index.html sets data-theme on <html> before first paint,
   * so the visual appearance is correct even before this signal updates.
   */
  readonly theme = signal<ThemeType>('auto');

  private readonly systemDarkQuery = signal(false);

  readonly isDark = computed(() => {
    if (!this.isBrowser) return false;
    const t = this.theme();
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return this.systemDarkQuery();
  });

  constructor() {
    if (!this.isBrowser) return;

    // Initialize system theme state
    this.systemDarkQuery.set(window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Apply saved theme AFTER hydration to avoid SSR/client mismatch.
    // The inline script in index.html already set data-theme visually.
    afterNextRender(() => {
      const saved = this.loadSavedTheme();
      if (saved !== 'auto') {
        this.theme.set(saved);
      }
    });

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
    mql.addEventListener('change', (e) => {
      this.systemDarkQuery.set(e.matches);
    });
  }

  toggleTheme(): void {
    const current = this.theme();
    const next: ThemeType = current === 'auto' ? 'light' : current === 'light' ? 'dark' : 'auto';
    this.theme.set(next);
  }

  private loadSavedTheme(): ThemeType {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    return 'auto';
  }
}
