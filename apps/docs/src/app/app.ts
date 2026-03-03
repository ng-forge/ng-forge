import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, NavigationEnd, NavigationStart } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent, NgDocThemeToggleComponent } from '@ng-doc/app';
import { NgDocThemeService } from '@ng-doc/app/services/theme';
import { map, startWith, of, skip, filter } from 'rxjs';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgDocButtonIconComponent, NgDocIconComponent, NgDocTooltipDirective } from '@ng-doc/ui-kit';

import { Logo } from './components/logo';
import { SidebarAccordionDirective } from './directives/sidebar-accordion.directive';
import { AdapterSubBarComponent } from './components/adapter-sub-bar/adapter-sub-bar.component';
import { ActiveAdapterService } from './services/active-adapter.service';
import { isAdapterName } from '@ng-forge/sandbox-harness';

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
    AdapterSubBarComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dark]': 'isDark()',
  },
})
export class App implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly router = inject(Router);
  private readonly activeAdapter = inject(ActiveAdapterService);
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
    return url === '/' || url === '';
  });

  theme = toSignal(
    this.isBrowser ? this.themeService.themeChanges().pipe(startWith(this.themeService.currentTheme)) : of('auto' as const),
    { requireSync: true },
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
    // Intercept ng-doc absolute sidebar links and prepend the active adapter prefix.
    // ng-doc generates absolute routes like '/getting-started'; with /:adapter routing
    // these need to become '/material/getting-started' etc.
    this.router.events
      .pipe(
        filter((e): e is NavigationStart => e instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        const url = e.url;
        // Skip landing page and hash anchors (e.g. /#features)
        if (url === '/' || url === '' || url.startsWith('/#')) return;
        const firstSegment = url.split('/')[1];
        // Only intercept if the first segment isn't a known docs adapter
        if (!isAdapterName(firstSegment) || firstSegment === 'core') {
          void this.router.navigateByUrl(`/${this.activeAdapter.adapter()}${url}`, { replaceUrl: true });
        }
      });

    if (this.isBrowser) {
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
