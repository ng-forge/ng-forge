import { Component, effect, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterModule, IonApp, IonRouterOutlet],
  selector: 'example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[class.dark]': 'isDark()',
  },
})
export class App implements OnInit {
  protected title = 'Ionic Examples';

  // Listen for theme change messages from parent window
  isDark = toSignal(
    fromEvent<MessageEvent>(window, 'message').pipe(
      filter((event) => event.data?.type === 'theme-change'),
      map((event) => event.data.isDark as boolean),
    ),
    { initialValue: false },
  );

  constructor() {
    // Update document root when signal changes
    effect(() => {
      const darkMode = this.isDark();
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  ngOnInit(): void {
    // Request initial theme state from parent
    window.parent.postMessage({ type: 'request-theme' }, '*');
  }
}
