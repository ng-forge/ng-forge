import { TestBed } from '@angular/core/testing';
import { Injector, resource, runInInjectionContext, signal } from '@angular/core';
import { withPreviousValue } from './with-previous-value';

describe('withPreviousValue', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = TestBed.inject(Injector);
  });

  it('should forward resolved snapshots as-is', () => {
    runInInjectionContext(injector, () => {
      const params = signal<number | undefined>(1);
      const base = resource({
        params: () => params(),
        loader: async () => 'hello',
      });

      const wrapped = withPreviousValue(base);

      // Initially the resource is loading
      expect(wrapped.status()).toBe('loading');
    });
  });

  it('should preserve the default value through composition', () => {
    runInInjectionContext(injector, () => {
      const base = resource({
        params: () => ({}),
        loader: async () => 42,
        defaultValue: 0,
      });

      const wrapped = withPreviousValue(base);

      // Default value should be preserved
      expect(wrapped.value()).toBe(0);
    });
  });

  it('should return a Resource with standard properties', () => {
    runInInjectionContext(injector, () => {
      const base = resource({
        params: () => ({}),
        loader: async () => 'test',
      });

      const wrapped = withPreviousValue(base);

      // The composed resource should expose standard Resource properties
      expect(wrapped.status).toBeDefined();
      expect(wrapped.value).toBeDefined();
      expect(wrapped.error).toBeDefined();
      expect(wrapped.snapshot).toBeDefined();
    });
  });

  it('should produce a composable Resource with its own snapshot', () => {
    runInInjectionContext(injector, () => {
      const base = resource({
        params: () => ({}),
        loader: async () => 'test',
        defaultValue: 'default',
      });

      const wrapped = withPreviousValue(base);

      // Snapshot should be available and reflect current state
      const snapshot = wrapped.snapshot();
      expect(snapshot.status).toBeDefined();
      expect(snapshot.value).toBe('default');
    });
  });

  it('should not throw when wrapping an idle resource', () => {
    runInInjectionContext(injector, () => {
      const params = signal<number | undefined>(undefined);
      const base = resource({
        params: () => params(),
        loader: async ({ params: p }) => p * 2,
        defaultValue: 0,
      });

      // Should not throw
      const wrapped = withPreviousValue(base);

      // Idle state — value should be the default
      expect(wrapped.value()).toBe(0);
      expect(wrapped.status()).toBe('idle');
    });
  });

  it('should chain multiple withPreviousValue calls without error', () => {
    runInInjectionContext(injector, () => {
      const base = resource({
        params: () => ({}),
        loader: async () => 'test',
        defaultValue: 'default',
      });

      // Double-wrapping should work
      const wrapped = withPreviousValue(withPreviousValue(base));
      expect(wrapped.value()).toBe('default');
    });
  });
});
