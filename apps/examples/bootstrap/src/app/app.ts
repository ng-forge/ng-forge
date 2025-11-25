import { Component, computed, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';

@Component({
  imports: [RouterModule],
  selector: 'bs-example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'Bootstrap Examples';

  // Listen for theme change messages from parent window
  theme = toSignal(
    fromEvent<MessageEvent>(window, 'message').pipe(
      filter((event) => event.data?.type === 'theme-change'),
      map((event) => event.data.theme as string),
    ),
    { initialValue: 'auto' },
  );

  constructor() {
    // Update document root data-theme and data-bs-theme attributes when theme changes
    explicitEffect([this.theme], ([theme]) => {
      if (theme === 'auto') {
        // For auto mode, set based on system preference (Bootstrap needs data-bs-theme)
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const resolvedTheme = prefersDark ? 'dark' : 'light';
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.setAttribute('data-bs-theme', resolvedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-bs-theme', theme);
      }
    });
  }

  ngOnInit(): void {
    // Request initial theme state from parent
    window.parent.postMessage({ type: 'request-theme' }, '*');
  }
}
