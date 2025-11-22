import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent, NgDocThemeToggleComponent } from '@ng-doc/app';
import { NgDocThemeService } from '@ng-doc/app/services/theme';
import { fromEvent, map, startWith, filter } from 'rxjs';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';

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
      map((theme) => theme === 'dark'),
    ),
    { requireSync: true },
  );

  constructor() {
    // Send dark mode changes to all iframes (example apps)
    explicitEffect([this.isDark], ([isDark]) => {
      const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
      iframes.forEach((iframe) => {
        iframe.contentWindow?.postMessage({ type: 'theme-change', isDark }, '*');
      });
    });

    // Listen for theme requests from iframes
    fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filter((event) => event.data?.type === 'request-theme'),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        event.source?.postMessage({ type: 'theme-change', isDark: this.isDark() }, '*' as any);
      });
  }

  ngOnInit(): void {
    this.themeService.set('auto');
  }
}
