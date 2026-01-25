import { Component, inject, OnInit, PLATFORM_ID, afterNextRender, DestroyRef, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent, NgDocThemeToggleComponent } from '@ng-doc/app';
import { NgDocThemeService } from '@ng-doc/app/services/theme';
import { fromEvent, map, startWith, of, skip, filter } from 'rxjs';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgDocButtonIconComponent, NgDocIconComponent, NgDocTooltipDirective } from '@ng-doc/ui-kit';

import { Logo } from './components/logo';
import { SidebarAccordionDirective } from './directives/sidebar-accordion.directive';

const THEME_STORAGE_KEY = 'ng-forge-docs-theme';
type ThemeType = 'auto' | 'light' | 'dark';

// NgDoc uses null for light theme (removes data-theme attribute)
function themeToStorageValue(theme: string | null): ThemeType {
  if (theme === null) return 'light';
  if (theme === 'auto' || theme === 'dark') return theme;
  return 'auto';
}

function storageValueToTheme(value: string | null): string | undefined {
  if (value === 'light') return undefined; // undefined removes data-theme attribute
  if (value === 'auto' || value === 'dark') return value;
  return 'auto';
}

@Component({
  imports: [
    RouterModule,
    NgDocRootComponent,
    NgDocNavbarComponent,
    NgDocSidebarComponent,
    NgDocThemeToggleComponent,
    NgDocIconComponent,
    NgDocButtonIconComponent,
    NgDocTooltipDirective,
    Logo,
    SidebarAccordionDirective,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    'class.dark': 'isDark()',
  },
})
export class App implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly themeService = inject(NgDocThemeService);

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
    // Handle hash-based URLs like /#features, /#validation, etc.
    return url === '/' || url === '' || url.startsWith('/#');
  });

  theme = toSignal(
    this.isBrowser ? this.themeService.themeChanges().pipe(startWith(this.themeService.currentTheme)) : of('auto' as const),
    {
      requireSync: true,
    },
  );

  isDark = toSignal(
    this.isBrowser
      ? this.themeService.themeChanges().pipe(
          startWith(this.themeService.currentTheme),
          map((theme) => theme === 'dark'),
        )
      : of(false),
    { requireSync: true },
  );

  constructor() {
    // Only run browser-specific code in the browser
    if (this.isBrowser) {
      // Send theme changes to all iframes after first render
      afterNextRender(() => {
        // Subscribe to theme changes and broadcast to iframes
        this.themeService
          .themeChanges()
          .pipe(startWith(this.themeService.currentTheme), takeUntilDestroyed(this.destroyRef))
          .subscribe((theme) => {
            const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
            iframes.forEach((iframe) => {
              iframe.contentWindow?.postMessage({ type: 'theme-change', theme }, '*');
            });
          });

        // Listen for theme requests from iframes
        fromEvent<MessageEvent>(window, 'message')
          .pipe(
            filter((event) => event.data?.type === 'request-theme'),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe((event) => {
            (event.source as Window)?.postMessage({ type: 'theme-change', theme: this.theme() }, '*');
          });

        // Listen for iframe height updates and resize accordingly
        // Uses route path for deterministic matching between iframe src and child route
        fromEvent<MessageEvent>(window, 'message')
          .pipe(
            filter(
              (event) =>
                event.data?.type === 'iframe-height' && typeof event.data.height === 'number' && typeof event.data.route === 'string',
            ),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe((event) => {
            const { height, route } = event.data;
            const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
            iframes.forEach((iframe) => {
              // Match iframe by checking if its src contains the route path
              if (iframe.src.includes(`#${route}`) || iframe.src.includes(`#${route}?`)) {
                iframe.style.height = `${height}px`;
              }
            });
          });
      });

      // Save theme changes to localStorage (skip initial emission)
      this.themeService
        .themeChanges()
        .pipe(skip(1), takeUntilDestroyed())
        .subscribe((theme) => {
          localStorage.setItem(THEME_STORAGE_KEY, themeToStorageValue(theme));
        });
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      this.themeService.set(storageValueToTheme(savedTheme));
    }
  }
}
