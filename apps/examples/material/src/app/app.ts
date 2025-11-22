import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';

@Component({
  imports: [RouterModule],
  selector: 'example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[attr.data-theme]': 'isDark() ? "dark" : "light"',
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
    explicitEffect([this.isDark], ([isDark]) => {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    });
  }

  ngOnInit(): void {
    // Request initial theme state from parent
    window.parent.postMessage({ type: 'request-theme' }, '*');
  }
}
