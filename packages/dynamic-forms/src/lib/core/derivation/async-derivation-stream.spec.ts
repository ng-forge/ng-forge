import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { computed, signal, WritableSignal } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { createAsyncDerivationStream, AsyncDerivationStreamContext } from './async-derivation-stream';
import { DerivationEntry } from './derivation-types';
import { Logger } from '../../providers/features/logger/logger.interface';
import { DerivationLogger } from './derivation-logger.service';

describe('createAsyncDerivationStream', () => {
  function createMockLogger(): Logger {
    return {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
  }

  function createMockDerivationLogger(): DerivationLogger {
    return {
      cycleStart: vi.fn(),
      iteration: vi.fn(),
      evaluation: vi.fn(),
      summary: vi.fn(),
      maxIterationsReached: vi.fn(),
    };
  }

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

  function createAsyncEntry(fieldKey: string, options: Partial<DerivationEntry> = {}): DerivationEntry {
    return {
      fieldKey,
      dependsOn: options.dependsOn ?? ['productId'],
      condition: options.condition ?? true,
      asyncFunctionName: options.asyncFunctionName ?? 'fetchValue',
      trigger: options.trigger ?? 'onChange',
      isShorthand: options.isShorthand ?? false,
      stopOnUserOverride: options.stopOnUserOverride,
      reEngageOnDependencyChange: options.reEngageOnDependencyChange,
      debugName: options.debugName,
      debounceMs: options.debounceMs,
    };
  }

  let logger: Logger;
  let derivationLogger: DerivationLogger;
  let formValue$: Subject<Record<string, unknown>>;
  let mockAsyncFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = createMockLogger();
    derivationLogger = createMockDerivationLogger();
    formValue$ = new Subject<Record<string, unknown>>();
    mockAsyncFn = vi.fn().mockReturnValue(of(42));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createContext(
    form: Record<string, unknown>,
    formValueSignal: WritableSignal<Record<string, unknown>>,
    overrides: Partial<AsyncDerivationStreamContext> = {},
  ): AsyncDerivationStreamContext {
    return {
      formValue: formValueSignal,
      form: signal(form) as AsyncDerivationStreamContext['form'],
      logger,
      derivationLogger: signal(derivationLogger) as AsyncDerivationStreamContext['derivationLogger'],
      asyncDerivationFunctions: () => ({ fetchValue: mockAsyncFn }),
      ...overrides,
    };
  }

  describe('stream triggers async function when dependency changes', () => {
    it('should call async function when a dependency field changes', () => {
      const { form, values } = createMockForm({ productId: 'abc', price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      // Emit initial value
      formValue$.next({ productId: 'abc', price: 0 });
      // Emit changed value
      formValue$.next({ productId: 'xyz', price: 0 });

      // Advance past debounce
      vi.advanceTimersByTime(300);

      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
      expect(values.price).toBe(42);
    });

    it('should work with Observable-returning async functions', () => {
      const { form, values } = createMockForm({ productId: 'abc', price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      mockAsyncFn.mockReturnValue(of(99));

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });
      vi.advanceTimersByTime(300);

      expect(values.price).toBe(99);
    });
  });

  describe('dependency filtering', () => {
    it('should not trigger again when only non-dependency fields change after initial load', () => {
      const { form } = createMockForm({ productId: 'abc', name: 'test', price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', name: 'test', price: 0 });

      let callCount = 0;
      const trackingFn = vi.fn().mockImplementation(() => {
        callCount++;
        return of(42);
      });

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
      });

      const context = createContext(form, formValueSignal, {
        asyncDerivationFunctions: () => ({ fetchValue: trackingFn }),
      });
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      // Initial emission triggers (all fields seen as changed vs null)
      formValue$.next({ productId: 'abc', name: 'test', price: 0 });
      vi.advanceTimersByTime(300);
      expect(callCount).toBe(1); // Initial load

      // Now change only 'name' — should NOT trigger
      formValue$.next({ productId: 'abc', name: 'changed', price: 0 });
      vi.advanceTimersByTime(300);
      expect(callCount).toBe(1); // No additional call
    });
  });

  describe('error handling', () => {
    it('should catch errors from async function and log warning', () => {
      const { form } = createMockForm({ productId: 'abc', price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      mockAsyncFn.mockReturnValue(throwError(() => new Error('Network error')));

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });
      vi.advanceTimersByTime(300);

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Async function failed'));
    });

    it('should catch errors from Observable-returning async functions', () => {
      const { form } = createMockForm({ productId: 'abc', price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      mockAsyncFn.mockReturnValue(throwError(() => new Error('Observable error')));

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });
      vi.advanceTimersByTime(300);

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Async function failed'));
    });
  });

  describe('stopOnUserOverride', () => {
    it('should skip async derivation when field is dirty and stopOnUserOverride is true', () => {
      const { form, dirtyStates } = createMockForm({ productId: 'abc', price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      dirtyStates['price'].set(true);

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
        stopOnUserOverride: true,
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });
      vi.advanceTimersByTime(300);

      expect(mockAsyncFn).not.toHaveBeenCalled();
      expect(derivationLogger.evaluation).toHaveBeenCalledWith(expect.objectContaining({ result: 'skipped', skipReason: 'user-override' }));
    });
  });

  describe('condition evaluation', () => {
    it('should skip async derivation when condition is false', () => {
      const { form } = createMockForm({ productId: 'abc', active: false, price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', active: false, price: 0 });

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
        condition: {
          type: 'fieldValue',
          fieldPath: 'active',
          operator: 'equals',
          value: true,
        },
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ productId: 'abc', active: false, price: 0 });
      formValue$.next({ productId: 'xyz', active: false, price: 0 });
      vi.advanceTimersByTime(300);

      expect(mockAsyncFn).not.toHaveBeenCalled();
      expect(derivationLogger.evaluation).toHaveBeenCalledWith(
        expect.objectContaining({ result: 'skipped', skipReason: 'condition-false' }),
      );
    });
  });

  describe('value equality skip', () => {
    it('should skip applying when value is unchanged', () => {
      const { form } = createMockForm({ productId: 'abc', price: 42 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 42 });

      // Async function returns same value as current
      mockAsyncFn.mockReturnValue(of(42));

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ productId: 'abc', price: 42 });
      formValue$.next({ productId: 'xyz', price: 42 });
      vi.advanceTimersByTime(300);

      expect(derivationLogger.evaluation).toHaveBeenCalledWith(
        expect.objectContaining({ result: 'skipped', skipReason: 'value-unchanged' }),
      );
    });
  });

  describe('missing function warning', () => {
    it('should warn when async function is not registered', () => {
      const { form } = createMockForm({ productId: 'abc', price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'nonExistentFunction',
      });

      const context = createContext(form, formValueSignal, {
        asyncDerivationFunctions: () => ({}),
      });
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });
      vi.advanceTimersByTime(300);

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("'nonExistentFunction' not found"));
    });
  });

  describe('reEngageOnDependencyChange', () => {
    it('should re-engage async derivation when dependency changes after user override', () => {
      const { form, values, dirtyStates } = createMockForm({ productId: 'abc', price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
        stopOnUserOverride: true,
        reEngageOnDependencyChange: true,
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      // Initial emission + change → triggers async
      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });
      vi.advanceTimersByTime(300);
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
      expect(values.price).toBe(42);

      // Mark field as dirty (user override)
      dirtyStates['price'].set(true);

      // Change dependency → should re-engage (clear dirty and fire async)
      mockAsyncFn.mockReturnValue(of(99));
      formValue$.next({ productId: 'new', price: 42 });
      vi.advanceTimersByTime(300);
      expect(mockAsyncFn).toHaveBeenCalledTimes(2);
      expect(values.price).toBe(99);
    });
  });

  describe('custom debounceMs', () => {
    it('should respect custom debounceMs value', () => {
      const { form, values } = createMockForm({ productId: 'abc', price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
        debounceMs: 600,
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });

      // At 300ms (default debounce), should not have fired yet
      vi.advanceTimersByTime(300);
      expect(mockAsyncFn).not.toHaveBeenCalled();

      // At 600ms, should fire
      vi.advanceTimersByTime(300);
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
      expect(values.price).toBe(42);
    });
  });

  describe('stream continues after error', () => {
    it('should continue processing after an async function error', () => {
      const { form, values } = createMockForm({ productId: 'abc', price: 0 });
      const formValueSignal = signal<Record<string, unknown>>({ productId: 'abc', price: 0 });

      // First call errors
      mockAsyncFn.mockReturnValueOnce(throwError(() => new Error('Network error')));
      // Second call succeeds
      mockAsyncFn.mockReturnValueOnce(of(99));

      const entry = createAsyncEntry('price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      // First emission → triggers error
      formValue$.next({ productId: 'abc', price: 0 });
      formValue$.next({ productId: 'xyz', price: 0 });
      vi.advanceTimersByTime(300);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Async function failed'));

      // Second emission → should succeed (stream not terminated)
      formValue$.next({ productId: 'new', price: 0 });
      vi.advanceTimersByTime(300);
      expect(mockAsyncFn).toHaveBeenCalledTimes(2);
      expect(values.price).toBe(99);
    });
  });

  describe('array field guard', () => {
    it('should return EMPTY for array placeholder paths', () => {
      const { form } = createMockForm({ items: [] });
      const formValueSignal = signal<Record<string, unknown>>({ items: [] });

      const entry = createAsyncEntry('items.$.price', {
        dependsOn: ['productId'],
        asyncFunctionName: 'fetchValue',
      });

      const context = createContext(form, formValueSignal);
      const stream$ = createAsyncDerivationStream(entry, formValue$, context);

      const emissions: void[] = [];
      stream$.subscribe({
        next: (v) => emissions.push(v),
      });

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('array field'));
      expect(emissions).toHaveLength(0);
    });
  });
});
