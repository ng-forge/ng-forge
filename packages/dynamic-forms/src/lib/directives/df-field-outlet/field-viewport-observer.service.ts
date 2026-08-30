import { DestroyRef, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { distinctUntilChanged, Observable, of } from 'rxjs';
import { normalizeFieldParkingMargin } from '../../providers/features/field-windowing/field-parking-margin';

const ALWAYS_VISIBLE = of(true);

type VisibilityListener = (visible: boolean) => void;

interface ObserverEntry {
  readonly observer: IntersectionObserver;
  readonly listeners: Map<Element, Set<VisibilityListener>>;
}

/**
 * Shares one native observer per margin. Subscriptions own element cleanup;
 * SSR and unsupported browsers always report visible.
 */
@Injectable()
export class FieldViewportObserver {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID)) && typeof IntersectionObserver !== 'undefined';
  private readonly observers = new Map<string, ObserverEntry>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const { observer } of this.observers.values()) observer.disconnect();
      this.observers.clear();
    });
  }

  observe(el: Element, rootMargin: string): Observable<boolean> {
    if (!this.isBrowser) return ALWAYS_VISIBLE;
    rootMargin = normalizeFieldParkingMargin(rootMargin);

    return new Observable<boolean>((subscriber) => {
      const listener: VisibilityListener = (visible) => subscriber.next(visible);
      this.startObserving(el, rootMargin, listener);
      // Native callbacks are asynchronous. Keep fields live until the first one.
      subscriber.next(true);
      return () => this.stopObserving(el, rootMargin, listener);
    }).pipe(distinctUntilChanged());
  }

  private startObserving(el: Element, rootMargin: string, listener: VisibilityListener): void {
    const entry = this.observerFor(rootMargin);
    const listeners = entry.listeners.get(el);
    if (listeners) {
      listeners.add(listener);
      return;
    }
    entry.listeners.set(el, new Set([listener]));
    entry.observer.observe(el);
  }

  private stopObserving(el: Element, rootMargin: string, listener: VisibilityListener): void {
    const entry = this.observers.get(rootMargin);
    if (!entry) return;
    const listeners = entry.listeners.get(el);
    if (!listeners) return;
    listeners.delete(listener);
    if (listeners.size > 0) return;

    entry.observer.unobserve(el);
    entry.listeners.delete(el);
    if (entry.listeners.size > 0) return;
    entry.observer.disconnect();
    this.observers.delete(rootMargin);
  }

  private observerFor(rootMargin: string): ObserverEntry {
    const existing = this.observers.get(rootMargin);
    if (existing) return existing;

    const listeners = new Map<Element, Set<VisibilityListener>>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          for (const listener of listeners.get(entry.target) ?? []) listener(entry.isIntersecting);
        }
      },
      { rootMargin },
    );
    const entry = { observer, listeners };
    this.observers.set(rootMargin, entry);
    return entry;
  }
}
