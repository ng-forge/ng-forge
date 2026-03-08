import { afterNextRender, Component } from '@angular/core';
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
export class App {
  protected title = 'Bootstrap Examples';

  // Listen for theme change messages from parent window
  private readonly theme = toSignal(
    fromEvent<MessageEvent>(window, 'message').pipe(
      filter((event) => event.data?.type === 'theme-change'),
      map((event) => event.data.theme as string),
    ),
    { initialValue: 'auto' },
  );

  constructor() {
    // Request initial theme state after first render
    afterNextRender(() => {
      window.parent.postMessage({ type: 'request-theme' }, '*');
    });

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
}
