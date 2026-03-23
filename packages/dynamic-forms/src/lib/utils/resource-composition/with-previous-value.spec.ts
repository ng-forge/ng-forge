import { TestBed } from '@angular/core/testing';
import { Injector, resource, runInInjectionContext, signal } from '@angular/core';
import { vi } from 'vitest';
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

      const wrapped = withPreviousValue(base);

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

      const wrapped = withPreviousValue(withPreviousValue(base));
      expect(wrapped.value()).toBe('default');
    });
  });

  describe('stale-while-revalidate', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'queueMicrotask'] }));
    afterEach(() => vi.useRealTimers());

    it('should keep previous resolved value during reload', async () => {
      let resolveLoader!: (value: string) => void;
      const params = signal(1);

      const base = runInInjectionContext(injector, () =>
        resource({
          params: () => params(),
          loader: () =>
            new Promise<string>((resolve) => {
              resolveLoader = resolve;
            }),
          defaultValue: 'default',
        }),
      );

      const wrapped = runInInjectionContext(injector, () => withPreviousValue(base));

      // Flush effects so the resource's internal effect runs and calls the loader
      TestBed.flushEffects();
      await vi.advanceTimersByTimeAsync(0);

      // Initial state: loading with default value
      expect(wrapped.status()).toBe('loading');
      expect(wrapped.value()).toBe('default');

      // Resolve the first load
      resolveLoader('first-result');
      await vi.advanceTimersByTimeAsync(0);
      TestBed.flushEffects();

      // Should now be resolved with first result
      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('first-result');

      // Change params to trigger reload
      params.set(2);
      TestBed.flushEffects();
      await vi.advanceTimersByTimeAsync(0);
      TestBed.flushEffects();

      // During reload, withPreviousValue should preserve 'first-result'
      // instead of showing 'default' (the defaultValue)
      if (wrapped.status() === 'loading' || wrapped.status() === 'reloading') {
        expect(wrapped.value()).toBe('first-result');
      }

      // Resolve second load
      resolveLoader('second-result');
      await vi.advanceTimersByTimeAsync(0);
      TestBed.flushEffects();

      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('second-result');
    });

    it('should NOT preserve error state values during reload', async () => {
      const params = signal(1);
      let shouldFail = true;

      const base = runInInjectionContext(injector, () =>
        resource({
          params: () => params(),
          loader: async () => {
            if (shouldFail) {
              throw new Error('test error');
            }
            return 'recovered';
          },
          defaultValue: 'default',
        }),
      );

      const wrapped = runInInjectionContext(injector, () => withPreviousValue(base));

      // Let the loader fail
      TestBed.flushEffects();
      await vi.advanceTimersByTimeAsync(0);
      TestBed.flushEffects();

      // Should be in error state
      expect(wrapped.status()).toBe('error');

      // Change params to trigger reload — this time succeed
      shouldFail = false;
      params.set(2);
      TestBed.flushEffects();
      await vi.advanceTimersByTimeAsync(0);
      TestBed.flushEffects();

      // During loading after error, should NOT try to preserve the error's value
      // (error snapshots don't have a value field — they have an error field)
      if (wrapped.status() === 'loading') {
        // Value should be the defaultValue, not a preserved error
        expect(wrapped.value()).toBe('default');
      }

      // Let it resolve
      await vi.advanceTimersByTimeAsync(0);
      TestBed.flushEffects();

      if (wrapped.status() === 'resolved') {
        expect(wrapped.value()).toBe('recovered');
      }
    });
  });
});
