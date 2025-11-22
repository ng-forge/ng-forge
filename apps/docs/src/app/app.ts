import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent, NgDocThemeToggleComponent } from '@ng-doc/app';
import { NgDocThemeService } from '@ng-doc/app/services/theme';
import { fromEvent, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterModule, NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent, NgDocThemeToggleComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[class.dark]': 'isDark()',
  },
})
export class App implements OnInit {
  readonly themeService = inject(NgDocThemeService);

  // Read dark mode from document element since ng-doc applies it there
  private darkSignal = signal(document.documentElement.classList.contains('dark'));
  isDark = computed(() => this.darkSignal());

  constructor() {
    // Observe .dark class on document element
    const observer = new MutationObserver(() => {
      this.darkSignal.set(document.documentElement.classList.contains('dark'));
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
  }
}
