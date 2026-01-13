import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fromEvent, merge, of } from 'rxjs';
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

  // Get initial theme from URL query parameter
  private getInitialTheme(): string {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return params.get('theme') || hashParams.get('theme') || 'auto';
  }

  // Listen for theme change messages from parent window, starting with URL param value
  private readonly theme = toSignal(
    merge(
      of(this.getInitialTheme()),
      fromEvent<MessageEvent>(window, 'message').pipe(
        filter((event) => event.data?.type === 'theme-change'),
        map((event) => event.data.theme as string),
      ),
    ),
    { initialValue: this.getInitialTheme() },
  );

  constructor() {
    // Update document root data-theme and data-bs-theme attributes when theme changes
    // Always set explicit value to override media query-based auto detection
    explicitEffect([this.theme], ([theme]) => {
      const resolvedTheme = this.resolveTheme(theme);
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      document.documentElement.setAttribute('data-bs-theme', resolvedTheme);
    });
  }

  // Resolve theme to 'dark' or 'light', handling 'auto' by checking system preference
  private resolveTheme(theme: string): 'dark' | 'light' {
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    // Auto or unknown - check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
