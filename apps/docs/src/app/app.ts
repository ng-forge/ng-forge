import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent, NgDocThemeToggleComponent } from '@ng-doc/app';
import { NgDocThemeService } from '@ng-doc/app/services/theme';
import { map, startWith, of, skip } from 'rxjs';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgDocButtonIconComponent, NgDocIconComponent, NgDocTooltipDirective } from '@ng-doc/ui-kit';

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
  readonly themeService = inject(NgDocThemeService);

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
