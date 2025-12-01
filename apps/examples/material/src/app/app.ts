import { afterNextRender, Component, inject, Injector, runInInjectionContext } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, filter, map, startWith, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';

/** Creates an observable from a ResizeObserver on the given element */
const resizeObserver$ = (element: Element): Observable<number> =>
  new Observable<ResizeObserverEntry[]>((subscriber) => {
    const observer = new ResizeObserver((entries) => subscriber.next(entries));
    observer.observe(element);
    return () => observer.disconnect();
  }).pipe(map(() => element.scrollHeight));

/** Creates an observable that emits after the next render */
const afterNextRender$ = (injector = inject(Injector)): Observable<void> =>
  new Observable((subscriber) => {
    runInInjectionContext(injector, () => {
      afterNextRender(() => {
        subscriber.next();
        subscriber.complete();
      });
    });
  });

@Component({
  imports: [RouterModule],
  selector: 'example-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Material Examples';

  // Listen for theme change messages from parent window
  private readonly theme = toSignal(
    fromEvent<MessageEvent>(window, 'message').pipe(
      filter((event) => event.data?.type === 'theme-change'),
      map((event) => event.data.theme as string),
    ),
    { initialValue: 'auto' },
  );

  // Track body height reactively after first render
  private readonly bodyHeight = toSignal(
    afterNextRender$().pipe(
      switchMap(() => resizeObserver$(document.body).pipe(startWith(document.body.scrollHeight), debounceTime(50))),
      takeUntilDestroyed(),
    ),
    { initialValue: 0 },
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

    // Report height changes to parent iframe
    explicitEffect([this.bodyHeight], ([height]) => {
      if (height > 0) {
        window.parent.postMessage({ type: 'iframe-height', height }, '*');
      }
    });
  }
}
