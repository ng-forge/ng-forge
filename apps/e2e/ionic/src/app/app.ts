import { afterNextRender, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';

@Component({
  imports: [RouterModule, IonApp, IonRouterOutlet],
  selector: 'example-root',
  templateUrl: './app.html',
})
export class App {
  protected title = 'Ionic Examples';

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
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    });
  }
}
