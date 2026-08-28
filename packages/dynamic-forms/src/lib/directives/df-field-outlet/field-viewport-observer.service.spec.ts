import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, switchMap } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FieldViewportObserver } from './field-viewport-observer.service';

let instances: MockIntersectionObserver[];

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly thresholds = [0];
  readonly rootMargin: string;
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.rootMargin = options?.rootMargin ?? '0px';
    instances.push(this);
  }

  emit(target: Element, isIntersecting: boolean): void {
    this.callback([{ target, isIntersecting } as IntersectionObserverEntry], this);
  }
}

describe('FieldViewportObserver', () => {
  const margin = '100px';
  const makeElement = (): HTMLElement => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    return el;
  };

  afterEach(() => vi.unstubAllGlobals());

  describe('in a browser', () => {
    let observer: FieldViewportObserver;

    beforeEach(() => {
      instances = [];
      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
      TestBed.configureTestingModule({ providers: [FieldViewportObserver] });
      observer = TestBed.inject(FieldViewportObserver);
    });

    it('starts lazily and seeds visible on subscription', () => {
      const visibility$ = observer.observe(makeElement(), margin);
      expect(instances).toHaveLength(0);

      const values: boolean[] = [];
      const subscription = visibility$.subscribe((visible) => values.push(visible));

      expect(values).toEqual([true]);
      expect(instances).toHaveLength(1);
      subscription.unsubscribe();
    });

    it('shares one native observer for elements using the same margin', () => {
      const first = makeElement();
      const second = makeElement();
      const firstSubscription = observer.observe(first, margin).subscribe();
      const secondSubscription = observer.observe(second, margin).subscribe();

      expect(instances).toHaveLength(1);
      expect(instances[0].observe).toHaveBeenCalledWith(first);
      expect(instances[0].observe).toHaveBeenCalledWith(second);

      firstSubscription.unsubscribe();
      secondSubscription.unsubscribe();
    });

    it('emits distinct visibility changes for the matching element', () => {
      const first = makeElement();
      const second = makeElement();
      const values: boolean[] = [];
      const subscription = observer.observe(first, margin).subscribe((visible) => values.push(visible));

      instances[0].emit(second, false);
      instances[0].emit(first, false);
      instances[0].emit(first, false);
      instances[0].emit(first, true);

      expect(values).toEqual([true, false, true]);
      subscription.unsubscribe();
    });

    it('switches observers when the subscribed margin changes', () => {
      const el = makeElement();
      const margin$ = new BehaviorSubject('100px');
      const subscription = margin$.pipe(switchMap((rootMargin) => observer.observe(el, rootMargin))).subscribe();

      margin$.next('200px');

      expect(instances.map((instance) => instance.rootMargin)).toEqual(['100px', '200px']);
      expect(instances[0].unobserve).toHaveBeenCalledWith(el);
      expect(instances[0].disconnect).toHaveBeenCalledTimes(1);
      expect(instances[1].observe).toHaveBeenCalledWith(el);
      subscription.unsubscribe();
    });

    it('keeps an element observed until its final subscriber leaves', () => {
      const el = makeElement();
      const visibility$ = observer.observe(el, margin);
      const first = visibility$.subscribe();
      const second = visibility$.subscribe();

      expect(instances[0].observe).toHaveBeenCalledTimes(1);
      first.unsubscribe();
      expect(instances[0].unobserve).not.toHaveBeenCalled();

      second.unsubscribe();
      expect(instances[0].unobserve).toHaveBeenCalledWith(el);
      expect(instances[0].disconnect).toHaveBeenCalledTimes(1);
    });

    it('disconnects an observer after its final element leaves', () => {
      const first = observer.observe(makeElement(), margin).subscribe();
      const second = observer.observe(makeElement(), margin).subscribe();

      first.unsubscribe();
      expect(instances[0].disconnect).not.toHaveBeenCalled();

      second.unsubscribe();
      expect(instances[0].disconnect).toHaveBeenCalledTimes(1);
    });

    it('falls back safely for an unsupported CSS unit', () => {
      const subscription = observer.observe(makeElement(), '1rem').subscribe();
      expect(instances[0].rootMargin).toBe('100%');
      subscription.unsubscribe();
    });
  });

  describe('on the server', () => {
    it('reports every element visible without creating a native observer', () => {
      instances = [];
      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }, FieldViewportObserver],
      });
      const observer = TestBed.inject(FieldViewportObserver);
      const values: boolean[] = [];

      observer.observe(makeElement(), margin).subscribe((visible) => values.push(visible));

      expect(values).toEqual([true]);
      expect(instances).toHaveLength(0);
    });
  });
});
