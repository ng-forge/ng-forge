import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { map, startWith, filter, skip } from 'rxjs';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ActiveAdapterService } from './services/active-adapter.service';

const THEME_STORAGE_KEY = 'ng-forge-docs-theme';
type ThemeType = 'auto' | 'light' | 'dark';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dark]': 'isDark()',
    '[attr.data-adapter]': 'activeAdapter.adapter()',
  },
})
export class App implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly router = inject(Router);
  protected readonly activeAdapter = inject(ActiveAdapterService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { requireSync: true },
  );

  readonly isLandingPage = computed(() => {
    const url = this.currentUrl();
    return url === '/' || url === '';
  });

  /** Current theme: 'auto' | 'light' | 'dark' */
  readonly theme = signal<ThemeType>('auto');

  readonly isDark = computed(() => {
    // In SSR, default to false (auto resolves on client)
    if (!this.isBrowser) return false;
    const t = this.theme();
    if (t === 'dark') return true;
    if (t === 'light') return false;
    // auto — check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  constructor() {
    if (this.isBrowser) {
      // Listen for system theme changes when in auto mode
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', () => {
        // Force re-evaluation by re-setting the same value
        this.theme.update((t) => t);
      });
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType | null;
      if (saved === 'light' || saved === 'dark' || saved === 'auto') {
        this.theme.set(saved);
      }
      this.applyThemeAttribute();
    }
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
