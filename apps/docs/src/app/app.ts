import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent, NgDocThemeToggleComponent } from '@ng-doc/app';
import { NgDocThemeService } from '@ng-doc/app/services/theme';
import { fromEvent, map, startWith, filter } from 'rxjs';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterModule, NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent, NgDocThemeToggleComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    'class.dark': 'isDark()',
  },
})
export class App implements OnInit {
  readonly themeService = inject(NgDocThemeService);

  isDark = toSignal(
    this.themeService.themeChanges().pipe(
      startWith(this.themeService.currentTheme),
      map((theme) => {
        // For 'auto' mode, check if document has .dark class applied by ng-doc
        // For explicit 'dark' or 'light', use the theme value
        if (theme === 'auto') {
          return document.documentElement.classList.contains('dark');
        }
        return theme === 'dark';
      }),
    ),
    { requireSync: true },
  );

  constructor() {
    // Observe .dark class changes on document for auto mode
    // This ensures we detect system preference changes
    const observer = new MutationObserver(() => {
      const currentTheme = this.themeService.currentTheme;
      if (currentTheme === 'auto') {
        // Manually trigger a theme change check
        this.themeService.set('auto');
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Send dark mode changes to all iframes (example apps)
    effect(() => {
      const darkMode = this.isDark();
      // Find all iframes and send them the dark mode state
      const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
      iframes.forEach((iframe) => {
        // Use '*' as targetOrigin since example apps may be on different ports in dev
        iframe.contentWindow?.postMessage({ type: 'theme-change', isDark: darkMode }, '*');
      });
    });

    // Listen for theme requests from iframes using fromEvent
    fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filter((event) => event.data?.type === 'request-theme'),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        // Send current theme to the requesting iframe
        event.source?.postMessage({ type: 'theme-change', isDark: this.isDark() }, '*' as any);
      });
  }

  ngOnInit(): void {
    this.themeService.set('auto');

    // Recheck dark mode after ng-doc has initialized
    // This handles the initial load case where .dark class might not be applied yet
    setTimeout(() => {
      this.themeService.set('auto'); // Trigger re-evaluation
    }, 100);
  }
}
