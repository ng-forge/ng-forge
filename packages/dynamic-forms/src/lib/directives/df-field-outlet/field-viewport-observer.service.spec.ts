import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FieldViewportObserver } from './field-viewport-observer.service';

/**
 * Covers the deterministic surface only. Whether the browser reports a given
 * element as intersecting is the browser's job, and asserting on real
 * `IntersectionObserver` callbacks here would buy a timing-flaky test for
 * something the E2E layer already exercises against a real scroll.
 */
describe('FieldViewportObserver', () => {
  const margin = '100px';

  afterEach(() => vi.unstubAllGlobals());

  const makeElement = (): HTMLElement => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    return el;
  };

  describe('in a browser', () => {
    let observer: FieldViewportObserver;

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [FieldViewportObserver] });
      observer = TestBed.inject(FieldViewportObserver);
    });

    it('seeds visible so nothing parks before the first callback', () => {
      expect(observer.observe(makeElement(), margin)()).toBe(true);
    });

    it('returns the same signal for a repeat observe of one element', () => {
      const el = makeElement();
      expect(observer.observe(el, margin)).toBe(observer.observe(el, margin));
    });

    it('hands out independent signals per element', () => {
      expect(observer.observe(makeElement(), margin)).not.toBe(observer.observe(makeElement(), margin));
    });

    it('re-observing after unobserve produces a fresh signal', () => {
      const el = makeElement();
      const first = observer.observe(el, margin);
      observer.unobserve(el);
      expect(observer.observe(el, margin)).not.toBe(first);
    });

    it('moves an existing element when its root margin changes', () => {
      const instances: MockIntersectionObserver[] = [];

      class MockIntersectionObserver implements IntersectionObserver {
        readonly root = null;
        readonly thresholds = [0];
        readonly rootMargin: string;
        readonly observe = vi.fn();
        readonly unobserve = vi.fn();
        readonly disconnect = vi.fn();
        readonly takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);

        constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          this.rootMargin = options?.rootMargin ?? '0px';
          instances.push(this);
        }
      }

      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [FieldViewportObserver] });
      observer = TestBed.inject(FieldViewportObserver);
      const el = makeElement();

      const visibility = observer.observe(el, '100px');
      expect(observer.observe(el, '200px')).toBe(visibility);

      expect(instances.map((instance) => instance.rootMargin)).toEqual(['100px', '200px']);
      expect(instances[0].unobserve).toHaveBeenCalledWith(el);
      expect(instances[1].observe).toHaveBeenCalledWith(el);
    });

    it('unobserve is inert for an element that was never observed', () => {
      expect(() => observer.unobserve(makeElement())).not.toThrow();
    });

    it('disconnects and releases an observer after its final element leaves', () => {
      const instances: MockIntersectionObserver[] = [];

      class MockIntersectionObserver implements IntersectionObserver {
        readonly root = null;
        readonly thresholds = [0];
        readonly rootMargin: string;
        readonly observe = vi.fn();
        readonly unobserve = vi.fn();
        readonly disconnect = vi.fn();
        readonly takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);

        constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          this.rootMargin = options?.rootMargin ?? '0px';
          instances.push(this);
        }
      }

      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [FieldViewportObserver] });
      observer = TestBed.inject(FieldViewportObserver);
      const first = makeElement();

      observer.observe(first, margin);
      observer.unobserve(first);
      observer.observe(makeElement(), margin);

      expect(instances).toHaveLength(2);
      expect(instances[0].disconnect).toHaveBeenCalledTimes(1);
    });

    it('falls back safely when called with an unsupported CSS unit', () => {
      const margins: string[] = [];

      class MockIntersectionObserver implements IntersectionObserver {
        readonly root = null;
        readonly thresholds = [0];
        readonly rootMargin: string;
        readonly observe = vi.fn();
        readonly unobserve = vi.fn();
        readonly disconnect = vi.fn();
        readonly takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);

        constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          this.rootMargin = options?.rootMargin ?? '0px';
          margins.push(this.rootMargin);
        }
      }

      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [FieldViewportObserver] });
      observer = TestBed.inject(FieldViewportObserver);

      expect(() => observer.observe(makeElement(), '1rem')).not.toThrow();
      expect(margins).toEqual(['100%']);
    });
  });

  describe('on the server', () => {
    it('reports every element visible so nothing is parked during SSR', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }, FieldViewportObserver],
      });
      const observer = TestBed.inject(FieldViewportObserver);

      expect(observer.observe(makeElement(), margin)()).toBe(true);
      // One shared constant, so a server-rendered form allocates nothing per field.
      expect(observer.observe(makeElement(), margin)).toBe(observer.observe(makeElement(), margin));
    });
  });
});
