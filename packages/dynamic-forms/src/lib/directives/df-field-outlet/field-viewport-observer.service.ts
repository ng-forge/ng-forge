import { DestroyRef, inject, Injectable, PLATFORM_ID, Signal, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Every field is treated as visible where `IntersectionObserver` can't run. */
const ALWAYS_VISIBLE = signal(true).asReadonly();

/**
 * Hands out a `Signal<boolean>` per element reporting whether it currently
 * intersects the viewport (expanded by `rootMargin`). Backed by one shared
 * `IntersectionObserver` per distinct margin rather than one per field, so a
 * 240-field form costs one observer, not 240.
 *
 * Scoped to the form's injector, never `providedIn: 'root'` — the observer map
 * is mutable state, and module-scoped mutable state is shared across requests
 * under SSR.
 *
 * On the server, and in any browser without `IntersectionObserver`, every
 * element reports visible. That is the safe direction: fields render live and
 * nothing is parked, so behaviour degrades to today's.
 */
@Injectable()
export class FieldViewportObserver {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID)) && typeof IntersectionObserver !== 'undefined';

  /** One observer per distinct `rootMargin`; each tracks many elements. */
  private readonly observers = new Map<string, IntersectionObserver>();
  private readonly visibility = new WeakMap<Element, ReturnType<typeof signal<boolean>>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const observer of this.observers.values()) observer.disconnect();
      this.observers.clear();
    });
  }

  /**
   * Start reporting visibility for `el`. Seeded `true` so a field is never
   * parked before the observer has had a chance to say otherwise — the first
   * callback arrives asynchronously, and seeding `false` would park every
   * field for one frame on mount.
   */
  observe(el: Element, rootMargin: string): Signal<boolean> {
    if (!this.isBrowser) return ALWAYS_VISIBLE;

    const existing = this.visibility.get(el);
    if (existing) return existing.asReadonly();

    const state = signal(true);
    this.visibility.set(el, state);
    this.observerFor(rootMargin).observe(el);
    return state.asReadonly();
  }

  /** Stop tracking `el`. Safe to call for an element that was never observed. */
  unobserve(el: Element): void {
    if (!this.isBrowser) return;
    this.visibility.delete(el);
    for (const observer of this.observers.values()) observer.unobserve(el);
  }

  private observerFor(rootMargin: string): IntersectionObserver {
    const existing = this.observers.get(rootMargin);
    if (existing) return existing;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          this.visibility.get(entry.target)?.set(entry.isIntersecting);
        }
      },
      { rootMargin },
    );
    this.observers.set(rootMargin, observer);
    return observer;
  }
}
