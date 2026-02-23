import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { computed, signal, WritableSignal } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { createHttpDerivationStream, HttpDerivationStreamContext } from './http-derivation-stream';
import { DerivationEntry } from './derivation-types';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationLogger } from './derivation-logger.service';

describe('createHttpDerivationStream', () => {
  /**
   * Mock logger for testing.
   */
  function createMockLogger(): Logger {
    return {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
  }

  /**
   * Mock derivation logger for testing (no-op implementation).
   */
  function createMockDerivationLogger(): DerivationLogger {
    return {
      cycleStart: vi.fn(),
      iteration: vi.fn(),
      evaluation: vi.fn(),
      summary: vi.fn(),
      maxIterationsReached: vi.fn(),
    };
  }

  /**
   * Mock form that mimics Angular Signal Forms structure.
   */
  function createMockForm(initialValue: Record<string, unknown>): {
    form: Record<string, unknown>;
    values: Record<string, unknown>;
    dirtyStates: Record<string, WritableSignal<boolean>>;
  } {
    const values = { ...initialValue };
    const form: Record<string, unknown> = {};
    const dirtyStates: Record<string, WritableSignal<boolean>> = {};

    for (const key of Object.keys(initialValue)) {
      const valueSignal = signal(values[key]);
      const dirtySignal = signal(false);
      const touchedSignal = signal(false);
      dirtyStates[key] = dirtySignal;

      const fieldInstance = {
        value: valueSignal,
        dirty: dirtySignal,
        touched: touchedSignal,
        reset: () => {
          dirtySignal.set(false);
          touchedSignal.set(false);
        },
      };

      form[key] = computed(() => fieldInstance);

      Object.defineProperty(values, key, {
        get: () => valueSignal(),
        set: (v: unknown) => valueSignal.set(v),
        enumerable: true,
        configurable: true,
      });
    }

    return { form, values, dirtyStates };
  }

  /**
   * Helper to create a derivation entry with HTTP config.
   */
  function createHttpEntry(fieldKey: string, options: Partial<DerivationEntry> = {}): DerivationEntry {
    return {
      fieldKey,
      dependsOn: options.dependsOn ?? ['country'],
      condition: options.condition ?? true,
      http: options.http ?? {
        url: 'https://api.example.com/rate',
        method: 'GET',
      },
      responseExpression: options.responseExpression ?? 'response.rate',
      trigger: options.trigger ?? 'onChange',
      debounceMs: options.debounceMs,
      isShorthand: options.isShorthand ?? false,
      stopOnUserOverride: options.stopOnUserOverride,
      reEngageOnDependencyChange: options.reEngageOnDependencyChange,
      debugName: options.debugName,
    };
  }

  let logger: Logger;
  let derivationLogger: DerivationLogger;
  let mockHttpClient: { request: ReturnType<typeof vi.fn> };
  let formValue$: Subject<Record<string, unknown>>;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = createMockLogger();
    derivationLogger = createMockDerivationLogger();
    mockHttpClient = { request: vi.fn().mockReturnValue(of({ rate: 1.5 })) };
    formValue$ = new Subject<Record<string, unknown>>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createContext(
    form: Record<string, unknown>,
    formValueSignal: WritableSignal<Record<string, unknown>>,
    overrides: Partial<HttpDerivationStreamContext> = {},
  ): HttpDerivationStreamContext {
    return {
      formValue: formValueSignal,
      form: signal(form) as HttpDerivationStreamContext['form'],
      httpClient: mockHttpClient as unknown as HttpDerivationStreamContext['httpClient'],
      logger,
      derivationLogger: signal(derivationLogger) as HttpDerivationStreamContext['derivationLogger'],
      isGenerationCurrent: () => true,
      ...overrides,
    };
  }

  describe('stream triggers HTTP request when dependency changes', () => {
    it('should make HTTP request when a dependency field changes', () => {
      const { form, values } = createMockForm({ country: 'USA', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', rate: 0 });

      const entry = createHttpEntry('rate', {
        dependsOn: ['country'],
        http: { url: 'https://api.example.com/rate', method: 'GET' },
        responseExpression: 'response.rate',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);

      const emissions: void[] = [];
      stream$.subscribe((v) => emissions.push(v));

      // Emit initial value
      formValue$.next({ country: 'USA', rate: 0 });
      // Emit changed value (country changed)
      formValue$.next({ country: 'UK', rate: 0 });

      // Advance past debounce (default 300ms)
      vi.advanceTimersByTime(300);

      expect(mockHttpClient.request).toHaveBeenCalledTimes(1);
      expect(mockHttpClient.request).toHaveBeenCalledWith('GET', 'https://api.example.com/rate', {
        body: undefined,
        headers: undefined,
      });
      // Value should be applied to form
      expect(values.rate).toBe(1.5);
    });

    it('should apply the extracted response value to the form field', () => {
      const { form, values } = createMockForm({ country: 'USA', exchangeRate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', exchangeRate: 0 });

      mockHttpClient.request.mockReturnValue(of({ data: { conversion: 2.75 } }));

      const entry = createHttpEntry('exchangeRate', {
        dependsOn: ['country'],
        http: { url: 'https://api.example.com/fx', method: 'GET' },
        responseExpression: 'response.data.conversion',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ country: 'USA', exchangeRate: 0 });
      formValue$.next({ country: 'UK', exchangeRate: 0 });
      vi.advanceTimersByTime(300);

      expect(values.exchangeRate).toBe(2.75);
    });
  });

  describe('switchMap cancels in-flight request on new emission', () => {
    it('should cancel previous HTTP request when a new dependency change occurs', () => {
      const { form, values } = createMockForm({ country: 'USA', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', rate: 0 });

      // Track subscription teardown
      const slowResponse$ = new Subject<{ rate: number }>();
      const fastResponse$ = of({ rate: 3.0 });

      let callCount = 0;
      mockHttpClient.request.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First request: returns a subject we can control
          return slowResponse$.asObservable();
        }
        return fastResponse$;
      });

      const entry = createHttpEntry('rate', { dependsOn: ['country'] });
      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      // First change
      formValue$.next({ country: 'USA', rate: 0 });
      formValue$.next({ country: 'UK', rate: 0 });
      vi.advanceTimersByTime(300);

      // First request should be made
      expect(mockHttpClient.request).toHaveBeenCalledTimes(1);

      // Second change before first resolves
      formValue$.next({ country: 'France', rate: 0 });
      vi.advanceTimersByTime(300);

      // Second request should be made; switchMap cancels the first
      expect(mockHttpClient.request).toHaveBeenCalledTimes(2);
      // The second response should be applied
      expect(values.rate).toBe(3.0);
    });
  });

  describe('responseExpression extracts value from response', () => {
    it('should use ExpressionParser to extract value from HTTP response', () => {
      const { form, values } = createMockForm({ source: 'a', target: '' });
      const formValueSignal = signal<Record<string, unknown>>({ source: 'a', target: '' });

      mockHttpClient.request.mockReturnValue(of({ nested: { deep: { value: 'extracted' } } }));

      const entry = createHttpEntry('target', {
        dependsOn: ['source'],
        responseExpression: 'response.nested.deep.value',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ source: 'a', target: '' });
      formValue$.next({ source: 'b', target: '' });
      vi.advanceTimersByTime(300);

      expect(values.target).toBe('extracted');
    });

    it('should log derivation as applied with previous and new values', () => {
      const { form } = createMockForm({ source: 'a', target: 'old' });
      const formValueSignal = signal<Record<string, unknown>>({ source: 'a', target: 'old' });

      mockHttpClient.request.mockReturnValue(of({ value: 'new' }));

      const entry = createHttpEntry('target', {
        dependsOn: ['source'],
        responseExpression: 'response.value',
        debugName: 'test-derivation',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ source: 'a', target: 'old' });
      formValue$.next({ source: 'b', target: 'old' });
      vi.advanceTimersByTime(300);

      expect(derivationLogger.evaluation).toHaveBeenCalledWith(
        expect.objectContaining({
          debugName: 'test-derivation',
          fieldKey: 'target',
          result: 'applied',
          previousValue: 'old',
          newValue: 'new',
        }),
      );
    });
  });

  describe('HTTP error handling', () => {
    it('should log warning and continue stream when HTTP request fails', () => {
      const { form } = createMockForm({ source: 'a', target: '' });
      const formValueSignal = signal<Record<string, unknown>>({ source: 'a', target: '' });

      mockHttpClient.request.mockReturnValue(throwError(() => new Error('Network error')));

      const entry = createHttpEntry('target', { dependsOn: ['source'] });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);

      let streamErrored = false;
      stream$.subscribe({
        error: () => (streamErrored = true),
      });

      formValue$.next({ source: 'a', target: '' });
      formValue$.next({ source: 'b', target: '' });
      vi.advanceTimersByTime(300);

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("HTTP request failed for 'target': Network error"));
      expect(streamErrored).toBe(false);

      // Stream should continue working — emit another change
      mockHttpClient.request.mockReturnValue(of({ rate: 5.0 }));
      formValue$.next({ source: 'c', target: '' });
      vi.advanceTimersByTime(300);

      expect(mockHttpClient.request).toHaveBeenCalledTimes(2);
    });

    it('should log warning when response processing throws', () => {
      const { form } = createMockForm({ source: 'a', target: '' });
      const formValueSignal = signal<Record<string, unknown>>({ source: 'a', target: '' });

      // Return a response that causes ExpressionParser.evaluate to fail
      mockHttpClient.request.mockReturnValue(of({ noRate: true }));

      const entry = createHttpEntry('target', {
        dependsOn: ['source'],
        // This expression will try to access a deep path that doesn't exist in a way that throws
        responseExpression: 'response.deeply.nested.value',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);

      let streamErrored = false;
      stream$.subscribe({
        error: () => (streamErrored = true),
      });

      formValue$.next({ source: 'a', target: '' });
      formValue$.next({ source: 'b', target: '' });
      vi.advanceTimersByTime(300);

      // Stream should not error out
      expect(streamErrored).toBe(false);
    });
  });

  describe('stopOnUserOverride skips when field is dirty', () => {
    it('should skip HTTP request when target field is dirty', () => {
      const { form, dirtyStates } = createMockForm({ country: 'USA', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', rate: 0 });

      // Simulate user editing the rate field
      dirtyStates['rate'].set(true);

      const entry = createHttpEntry('rate', {
        dependsOn: ['country'],
        stopOnUserOverride: true,
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ country: 'USA', rate: 0 });
      formValue$.next({ country: 'UK', rate: 0 });
      vi.advanceTimersByTime(300);

      // HTTP request should NOT be made
      expect(mockHttpClient.request).not.toHaveBeenCalled();

      // Derivation logger should record skip with user-override reason
      expect(derivationLogger.evaluation).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldKey: 'rate',
          result: 'skipped',
          skipReason: 'user-override',
        }),
      );
    });

    it('should make HTTP request when stopOnUserOverride is true but field is pristine', () => {
      const { form } = createMockForm({ country: 'USA', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', rate: 0 });
      // dirtyStates['rate'] defaults to false (pristine)

      const entry = createHttpEntry('rate', {
        dependsOn: ['country'],
        stopOnUserOverride: true,
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ country: 'USA', rate: 0 });
      formValue$.next({ country: 'UK', rate: 0 });
      vi.advanceTimersByTime(300);

      expect(mockHttpClient.request).toHaveBeenCalledTimes(1);
    });

    it('should re-engage HTTP derivation when reEngageOnDependencyChange is true and dependency changes after user override', () => {
      const { form, values, dirtyStates } = createMockForm({ country: 'USA', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', rate: 0 });

      const entry = createHttpEntry('rate', {
        dependsOn: ['country'],
        stopOnUserOverride: true,
        reEngageOnDependencyChange: true,
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      // Initial derivation fires (startWith(null) → pairwise → all keys changed)
      formValue$.next({ country: 'USA', rate: 0 });
      vi.advanceTimersByTime(300);
      expect(mockHttpClient.request).toHaveBeenCalledTimes(1);
      expect(values.rate).toBe(1.5);

      // Simulate user override — mark field as dirty
      dirtyStates['rate'].set(true);

      // Change dependency → should re-engage (clear dirty) and fire HTTP
      mockHttpClient.request.mockReturnValue(of({ rate: 2.5 }));
      formValue$.next({ country: 'UK', rate: 0 });
      vi.advanceTimersByTime(300);

      expect(mockHttpClient.request).toHaveBeenCalledTimes(2);
      expect(values.rate).toBe(2.5);
      // Dirty state should be cleared by resetFieldState
      expect(dirtyStates['rate']()).toBe(false);
    });
  });

  describe('condition evaluation', () => {
    it('should skip HTTP request when condition is false', () => {
      const { form } = createMockForm({ country: 'USA', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', rate: 0 });

      const entry = createHttpEntry('rate', {
        dependsOn: ['country'],
        condition: false,
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ country: 'USA', rate: 0 });
      formValue$.next({ country: 'UK', rate: 0 });
      vi.advanceTimersByTime(300);

      expect(mockHttpClient.request).not.toHaveBeenCalled();
      expect(derivationLogger.evaluation).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldKey: 'rate',
          result: 'skipped',
          skipReason: 'condition-false',
        }),
      );
    });

    it('should make HTTP request when condition is true', () => {
      const { form } = createMockForm({ country: 'USA', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', rate: 0 });

      const entry = createHttpEntry('rate', {
        dependsOn: ['country'],
        condition: true,
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ country: 'USA', rate: 0 });
      formValue$.next({ country: 'UK', rate: 0 });
      vi.advanceTimersByTime(300);

      expect(mockHttpClient.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('debounce batches rapid dependency changes', () => {
    it('should debounce rapid dependency changes using default debounce (300ms)', () => {
      const { form } = createMockForm({ country: 'USA', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', rate: 0 });

      const entry = createHttpEntry('rate', { dependsOn: ['country'] });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      // Emit initial value
      formValue$.next({ country: 'USA', rate: 0 });

      // Rapid changes within debounce window
      formValue$.next({ country: 'UK', rate: 0 });
      vi.advanceTimersByTime(100);
      formValue$.next({ country: 'France', rate: 0 });
      vi.advanceTimersByTime(100);
      formValue$.next({ country: 'Germany', rate: 0 });

      // Not enough time has passed
      vi.advanceTimersByTime(200);
      expect(mockHttpClient.request).not.toHaveBeenCalled();

      // After debounce period from last emission
      vi.advanceTimersByTime(100);
      expect(mockHttpClient.request).toHaveBeenCalledTimes(1);
    });

    it('should use custom debounceMs when provided', () => {
      const { form } = createMockForm({ country: 'USA', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', rate: 0 });

      const entry = createHttpEntry('rate', {
        dependsOn: ['country'],
        http: { url: 'https://api.example.com/rate', method: 'GET' },
        trigger: 'debounced',
        debounceMs: 500,
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ country: 'USA', rate: 0 });
      formValue$.next({ country: 'UK', rate: 0 });

      vi.advanceTimersByTime(400);
      expect(mockHttpClient.request).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockHttpClient.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('no request when no matching dependencies changed', () => {
    it('should not make HTTP request when changed fields do not match dependsOn', () => {
      const { form } = createMockForm({ country: 'USA', name: 'Alice', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', name: 'Alice', rate: 0 });

      const entry = createHttpEntry('rate', {
        dependsOn: ['country'],
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      // First emission establishes baseline (paired with null via startWith,
      // which means all keys appear changed — flush this through debounce first)
      formValue$.next({ country: 'USA', name: 'Alice', rate: 0 });
      vi.advanceTimersByTime(300);

      // Reset mock so we can assert only on the next change
      mockHttpClient.request.mockClear();

      // Only 'name' changed, not 'country' — should NOT trigger HTTP request
      formValue$.next({ country: 'USA', name: 'Bob', rate: 0 });
      vi.advanceTimersByTime(300);

      expect(mockHttpClient.request).not.toHaveBeenCalled();
    });

    it('should not trigger when dependsOn contains wildcard (blocked at collector level)', () => {
      // Wildcard dependencies are rejected by the collector at config validation time.
      // This test verifies the stream filter does NOT match wildcards — if one somehow
      // slips through, it should NOT trigger HTTP requests on every change.
      const { form } = createMockForm({ country: 'USA', name: 'Alice', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', name: 'Alice', rate: 0 });

      const entry = createHttpEntry('rate', {
        dependsOn: ['*'],
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ country: 'USA', name: 'Alice', rate: 0 });
      formValue$.next({ country: 'USA', name: 'Bob', rate: 0 });

      vi.advanceTimersByTime(300);

      // Wildcard is no longer matched in the stream filter — no HTTP request should fire
      expect(mockHttpClient.request).not.toHaveBeenCalled();
    });
  });

  describe('array field key warning', () => {
    it('should log warning and return EMPTY for array placeholder paths', () => {
      const { form } = createMockForm({ items: [] });
      const formValueSignal = signal<Record<string, unknown>>({ items: [] });

      const entry = createHttpEntry('items.$.rate', {
        dependsOn: ['items.$.country'],
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);

      let completed = false;
      let emissions = 0;
      stream$.subscribe({
        next: () => emissions++,
        complete: () => (completed = true),
      });

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("HTTP derivation for array field 'items.$.rate' is not supported"));
      expect(completed).toBe(true);
      expect(emissions).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should return EMPTY when entry has no http config', () => {
      const { form } = createMockForm({ source: 'a', target: '' });
      const formValueSignal = signal<Record<string, unknown>>({ source: 'a', target: '' });

      const entry: DerivationEntry = {
        fieldKey: 'target',
        dependsOn: ['source'],
        condition: true,
        trigger: 'onChange',
        isShorthand: false,
        // No http config
      };

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);

      let completed = false;
      stream$.subscribe({ complete: () => (completed = true) });

      expect(completed).toBe(true);
    });

    it('should skip when derived value equals current value', () => {
      const { form } = createMockForm({ source: 'a', target: 1.5 });
      const formValueSignal = signal<Record<string, unknown>>({ source: 'a', target: 1.5 });

      // HTTP returns same value as already on the form
      mockHttpClient.request.mockReturnValue(of({ rate: 1.5 }));

      const entry = createHttpEntry('target', {
        dependsOn: ['source'],
        responseExpression: 'response.rate',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ source: 'a', target: 1.5 });
      formValue$.next({ source: 'b', target: 1.5 });
      vi.advanceTimersByTime(300);

      expect(mockHttpClient.request).toHaveBeenCalledTimes(1);
      expect(derivationLogger.evaluation).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldKey: 'target',
          result: 'skipped',
          skipReason: 'value-unchanged',
        }),
      );
    });

    it('should resolve query params using expressions', () => {
      const { form } = createMockForm({ country: 'USA', rate: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ country: 'USA', rate: 0 });

      const entry = createHttpEntry('rate', {
        dependsOn: ['country'],
        http: {
          url: 'https://api.example.com/rate',
          method: 'GET',
          queryParams: { from: 'formValue.country' },
        },
      });

      mockHttpClient.request.mockReturnValue(of({ rate: 2.0 }));

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ country: 'USA', rate: 0 });
      formValue$.next({ country: 'UK', rate: 0 });
      vi.advanceTimersByTime(300);

      // Verify the URL includes the resolved query param
      expect(mockHttpClient.request).toHaveBeenCalledWith('GET', expect.stringContaining('from=UK'), expect.any(Object));
    });

    it('should pass body and headers to the HTTP client', () => {
      const { form } = createMockForm({ source: 'a', target: '' });
      const formValueSignal = signal<Record<string, unknown>>({ source: 'a', target: '' });

      mockHttpClient.request.mockReturnValue(of({ rate: 1.0 }));

      const entry = createHttpEntry('target', {
        dependsOn: ['source'],
        http: {
          url: 'https://api.example.com/data',
          method: 'POST',
          body: { key: 'value' },
          headers: { 'X-Custom': 'header-value' },
        },
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createHttpDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ source: 'a', target: '' });
      formValue$.next({ source: 'b', target: '' });
      vi.advanceTimersByTime(300);

      expect(mockHttpClient.request).toHaveBeenCalledWith('POST', 'https://api.example.com/data', {
        body: { key: 'value' },
        headers: { 'X-Custom': 'header-value' },
      });
    });
  });
});
