import { afterNextRender, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';

@Component({
  imports: [RouterModule],
  selector: 'example-root',
  templateUrl: './app.html',
})
export class App {
  protected title = 'PrimeNG Examples';

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

    // Update document root data-theme attribute when theme changes
    explicitEffect([this.theme], ([theme]) => {
      if (theme === 'auto') {
        // For auto mode, set based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    });
  }
}
