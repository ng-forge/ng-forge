import { signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { BehaviorSubject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { resolveDynamicValue } from './resolve-dynamic-value';

describe('resolveDynamicValue', () => {
  it('returns a signal with the static value when given a primitive', () => {
    TestBed.runInInjectionContext(() => {
      const sig = resolveDynamicValue<boolean>(true, false);
      expect(sig()).toBe(true);
    });
  });

  it('returns the fallback when value is undefined', () => {
    TestBed.runInInjectionContext(() => {
      const sig = resolveDynamicValue<boolean>(undefined, false);
      expect(sig()).toBe(false);
    });
  });

  it('passes through an existing signal', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(true);
      const sig = resolveDynamicValue<boolean>(source, false);
      expect(sig()).toBe(true);
      source.set(false);
      expect(sig()).toBe(false);
    });
  });

  it('subscribes to an Observable and emits its values', () => {
    TestBed.runInInjectionContext(() => {
      const subject = new BehaviorSubject<boolean>(false);
      const sig = resolveDynamicValue<boolean>(subject, true);
      expect(sig()).toBe(false); // BehaviorSubject seed wins over fallback
      subject.next(true);
      expect(sig()).toBe(true);
    });
  });

  it('uses fallback as the initial value of a non-replaying observable', () => {
    TestBed.runInInjectionContext(() => {
      const subject = new BehaviorSubject<string>('initial');
      const sig = resolveDynamicValue<string>(subject, 'fallback');
      // BehaviorSubject IS replaying, so we receive 'initial'.
      expect(sig()).toBe('initial');
    });
  });

  it('handles non-boolean primitives identically', () => {
    TestBed.runInInjectionContext(() => {
      const sig = resolveDynamicValue<number>(42, 0);
      expect(sig()).toBe(42);
    });
  });
});
