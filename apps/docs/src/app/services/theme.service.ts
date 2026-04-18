import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { explicitEffect } from 'ngxtension/explicit-effect';

const THEME_STORAGE_KEY = 'ng-forge-docs-theme';
export type ThemeType = 'auto' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Current theme: 'auto' | 'light' | 'dark'. Seeded from localStorage on
   * the client during construction so a refresh preserves the user's
   * preference. On the server it defaults to 'auto' (no localStorage).
   * The inline script in index.html sets the matching `data-theme` on
   * <html> before first paint, so FOUC is avoided without waiting for
   * Angular to boot.
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

    // Seed the theme from localStorage BEFORE the persist effect runs —
    // otherwise the effect's first emission (with the default 'auto') would
    // overwrite the saved preference on every reload.
    this.theme.set(this.loadSavedTheme());

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

    // Listen for system theme changes when in auto mode.
    // No cleanup needed — ThemeService is a root singleton that lives for the app lifetime.
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
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    return 'auto';
  }
}
