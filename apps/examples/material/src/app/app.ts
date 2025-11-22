import { Component, effect, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterModule],
  selector: 'example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[class.dark]': 'isDark()',
  },
})
export class App implements OnInit {
  protected title = 'Material Examples';

  // Listen for theme change messages from parent window
  isDark = toSignal(
    fromEvent<MessageEvent>(window, 'message').pipe(
      filter((event) => event.data?.type === 'theme-change'),
      map((event) => event.data.isDark as boolean),
    ),
    { initialValue: false },
  );

  constructor() {
    // Update document root data-theme attribute when signal changes
    effect(() => {
      const darkMode = this.isDark();
      document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    });
  }

  ngOnInit(): void {
    // Request initial theme state from parent
    window.parent.postMessage({ type: 'request-theme' }, '*');
  }
}
