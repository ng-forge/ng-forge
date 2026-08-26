import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FieldViewportObserver } from './field-viewport-observer.service';

/**
 * Covers the deterministic surface only. Whether the browser reports a given
 * element as intersecting is the browser's job, and asserting on real
 * `IntersectionObserver` callbacks here would buy a timing-flaky test for
 * something the E2E layer already exercises against a real scroll.
 */
describe('FieldViewportObserver', () => {
  const margin = '100px';

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

    it('unobserve is inert for an element that was never observed', () => {
      expect(() => observer.unobserve(makeElement())).not.toThrow();
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
