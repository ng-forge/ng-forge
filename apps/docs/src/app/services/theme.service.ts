import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const THEME_STORAGE_KEY = 'ng-forge-docs-theme';
export type ThemeType = 'auto' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Current theme: 'auto' | 'light' | 'dark' */
  readonly theme = signal<ThemeType>('auto');

  readonly isDark = computed(() => {
    if (!this.isBrowser) return false;
    const t = this.theme();
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  /** Call once from AppComponent.ngOnInit() */
  init(): void {
    if (!this.isBrowser) return;

    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      this.theme.set(saved);
    }
    this.applyThemeAttribute();

    // Listen for system theme changes when in auto mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', () => {
      // Force re-evaluation by re-setting the same value
      this.theme.update((t) => t);
    });
  }

  toggleTheme(): void {
    const current = this.theme();
    const next: ThemeType = current === 'auto' ? 'light' : current === 'light' ? 'dark' : 'auto';
    this.theme.set(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    this.applyThemeAttribute();
  }

  private applyThemeAttribute(): void {
    const t = this.theme();
    if (t === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
  }
}
