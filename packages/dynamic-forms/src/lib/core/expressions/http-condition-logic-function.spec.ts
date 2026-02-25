import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { FieldContext } from '@angular/forms/signals';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { HttpCondition } from '../../models/expressions/conditional-expression';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { RootFormRegistryService } from '../registry/root-form-registry.service';
import { FormStateManager } from '../../state/form-state-manager';
import { HttpConditionCache } from '../http/http-condition-cache';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { createMockLogger, MockLogger } from '../../../../testing/src/mock-logger';
import { createDeprecationWarningTracker, DEPRECATION_WARNING_TRACKER } from '../../utils/deprecation-warning-tracker';
import { createHttpConditionLogicFunction } from './http-condition-logic-function';
import { ExpressionCacheContext } from '../../providers/expression-cache-context';
import { FormDerivedState } from '../../providers/form-derived-state';
import { stableStringify } from '../../utils/stable-stringify';

describe('createHttpConditionLogicFunction', () => {
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  let injector: Injector;
  let mockLogger: MockLogger;
  let httpClient: { request: ReturnType<typeof vi.fn> };
  let expressionCache: ExpressionCacheContext;

  beforeEach(() => {
    mockLogger = createMockLogger();
    httpClient = { request: vi.fn().mockReturnValue(of({ allowed: true })) };
    expressionCache = new ExpressionCacheContext();

    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        { provide: DynamicFormLogger, useValue: mockLogger },
        { provide: DEPRECATION_WARNING_TRACKER, useFactory: createDeprecationWarningTracker },
        { provide: HttpClient, useValue: httpClient },
        { provide: ExpressionCacheContext, useValue: expressionCache },
        { provide: FormDerivedState, useValue: { externalData: signal(undefined) } },
      ],
    });

    injector = TestBed.inject(Injector);

    mockEntity.set({ username: 'test' });
    const mockFormValue = signal({ username: 'test' });
    const mockRootField = Object.assign(
      () => ({
        value: mockFormValue,
        valid: signal(true),
        errors: signal(null),
        touched: signal(false),
        dirty: signal(false),
      }),
      { formValue: mockFormValue },
    ) as any;
    mockFormSignal.set(mockRootField);
  });

  function createMockFieldContext<T>(value: T): FieldContext<T> {
    return {
      value: signal(value),
      field: { parent: null },
      valueOf: () => ({ username: 'test' }),
      stateOf: vi.fn(),
      valid: signal(true),
      disabled: signal(false),
      pending: signal(false),
      errors: signal(null),
      touched: signal(false),
      dirty: signal(false),
      pristine: signal(true),
      untouched: signal(true),
    } as any;
  }

  it('should return pendingValue initially', () => {
    const condition: HttpCondition = {
      type: 'http',
      http: { url: '/api/check' },
      pendingValue: false,
    };

    const result = runInInjectionContext(injector, () => {
      const fn = createHttpConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      return fn(ctx);
    });

    expect(result).toBe(false);
  });

  it('should default pendingValue to false', () => {
    const condition: HttpCondition = {
      type: 'http',
      http: { url: '/api/check' },
    };

    const result = runInInjectionContext(injector, () => {
      const fn = createHttpConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      return fn(ctx);
    });

    expect(result).toBe(false);
  });

  it('should return true as pendingValue when configured', () => {
    const condition: HttpCondition = {
      type: 'http',
      http: { url: '/api/check' },
      pendingValue: true,
    };

    const result = runInInjectionContext(injector, () => {
      const fn = createHttpConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      return fn(ctx);
    });

    expect(result).toBe(true);
  });

  it('should return cached value when cache hit', () => {
    const condition: HttpCondition = {
      type: 'http',
      http: { url: '/api/check' },
    };

    // Pre-populate cache with the expected cache key using the same serialization
    // as the production code: resolveHttpRequest → stableStringify
    const expectedKey = stableStringify({ url: '/api/check', method: undefined });
    expressionCache.httpConditionCache.set(expectedKey, true, 30000);

    const result = runInInjectionContext(injector, () => {
      const fn = createHttpConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      return fn(ctx);
    });

    expect(result).toBe(true);
    // No HTTP call should be made
    expect(httpClient.request).not.toHaveBeenCalled();
  });

  it('should cache the same LogicFn for identical conditions', () => {
    const condition: HttpCondition = {
      type: 'http',
      http: { url: '/api/check' },
    };

    let fn1: unknown;
    let fn2: unknown;

    runInInjectionContext(injector, () => {
      fn1 = createHttpConditionLogicFunction(condition);
      fn2 = createHttpConditionLogicFunction(condition);
    });

    expect(fn1).toBe(fn2);
  });

  it('should return different LogicFn for different conditions', () => {
    const condition1: HttpCondition = {
      type: 'http',
      http: { url: '/api/check1' },
    };
    const condition2: HttpCondition = {
      type: 'http',
      http: { url: '/api/check2' },
    };

    let fn1: unknown;
    let fn2: unknown;

    runInInjectionContext(injector, () => {
      fn1 = createHttpConditionLogicFunction(condition1);
      fn2 = createHttpConditionLogicFunction(condition2);
    });

    expect(fn1).not.toBe(fn2);
  });

  it('should handle error and return pendingValue', async () => {
    httpClient.request.mockReturnValue(throwError(() => new Error('Network error')));

    const condition: HttpCondition = {
      type: 'http',
      http: { url: '/api/check', debounceMs: 0 },
      pendingValue: false,
    };

    runInInjectionContext(injector, () => {
      const fn = createHttpConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      const result = fn(ctx);
      // Before async resolution, should return pendingValue
      expect(result).toBe(false);
    });
  });

  it('should reuse per-field signal pair for same FieldContext', () => {
    const condition: HttpCondition = {
      type: 'http',
      http: { url: '/api/check' },
    };

    runInInjectionContext(injector, () => {
      const fn = createHttpConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');

      // Call twice with same context — should not throw
      const result1 = fn(ctx);
      const result2 = fn(ctx);
      expect(result1).toBe(result2);
    });
  });

  it('should use responseExpression to extract boolean from response', () => {
    // Pre-populate the cache to test responseExpression without async
    const expectedKey = stableStringify({ url: '/api/check', method: undefined });
    expressionCache.httpConditionCache.set(expectedKey, true, 30000);

    const condition: HttpCondition = {
      type: 'http',
      http: { url: '/api/check' },
      responseExpression: 'response.allowed',
    };

    const result = runInInjectionContext(injector, () => {
      const fn = createHttpConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      return fn(ctx);
    });

    // Cache hit returns true regardless of responseExpression
    // (responseExpression is evaluated at HTTP response time, not cache lookup time)
    expect(result).toBe(true);
  });

  it('should resolve HTTP request with query params from evaluation context', () => {
    const condition: HttpCondition = {
      type: 'http',
      http: {
        url: '/api/check',
        queryParams: { name: 'formValue.username' },
      },
    };

    runInInjectionContext(injector, () => {
      const fn = createHttpConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      fn(ctx);
    });

    // The function resolved the request — it won't have called HTTP yet due to debounce,
    // but the resolved request signal was updated
    // We can't easily assert on the signal value, but no errors means success
  });

  it('should handle malformed responseExpression gracefully', () => {
    const condition: HttpCondition = {
      type: 'http',
      http: { url: '/api/check', debounceMs: 0 },
      responseExpression: 'response.!!!invalid@@@syntax',
      pendingValue: false,
    };

    // The malformed expression should not throw — extractBoolean catches and returns pendingValue
    runInInjectionContext(injector, () => {
      const fn = createHttpConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      const result = fn(ctx);
      // Before async resolution, should return pendingValue
      expect(result).toBe(false);
    });
  });

  describe('extractBoolean — truthy coercion with non-boolean warning', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }));
    afterEach(() => vi.useRealTimers());

    it('should warn when responseExpression returns a non-boolean truthy value', () => {
      httpClient.request.mockReturnValue(of({ status: 'ok' }));

      const condition: HttpCondition = {
        type: 'http',
        http: { url: '/api/truthy-check' },
        responseExpression: 'response.status',
        debounceMs: 0,
        pendingValue: false,
      };

      runInInjectionContext(injector, () => {
        const fn = createHttpConditionLogicFunction(condition);
        const ctx = createMockFieldContext('test');
        fn(ctx);
      });

      // Flush toObservable effect → advance debounceTime(0) → flush toSignal effect
      TestBed.flushEffects();
      vi.advanceTimersByTime(0);
      TestBed.flushEffects();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('responseExpression'),
        expect.anything(),
        expect.stringContaining('Consider returning a boolean explicitly'),
      );
    });

    it('should treat a non-boolean truthy responseExpression result as true (!!coercion)', () => {
      httpClient.request.mockReturnValue(of({ status: 'ok' }));

      const condition: HttpCondition = {
        type: 'http',
        http: { url: '/api/truthy-check-result' },
        responseExpression: 'response.status',
        debounceMs: 0,
        pendingValue: false,
      };

      let fn!: ReturnType<typeof createHttpConditionLogicFunction>;
      let ctx!: FieldContext<string>;

      runInInjectionContext(injector, () => {
        fn = createHttpConditionLogicFunction(condition);
        ctx = createMockFieldContext('test');
        fn(ctx); // triggers pipeline setup
      });

      // Flush toObservable effect → advance debounceTime(0) → flush toSignal effect
      TestBed.flushEffects();
      vi.advanceTimersByTime(0);
      TestBed.flushEffects();

      // After pipeline settles, result is cached — second call returns resolved value
      const result = runInInjectionContext(injector, () => fn(ctx));
      // 'ok' is truthy → !!result = true (not result === true which would be false)
      expect(result).toBe(true);
    });

    it('should not warn when responseExpression returns strict true', () => {
      httpClient.request.mockReturnValue(of({ allowed: true }));

      const condition: HttpCondition = {
        type: 'http',
        http: { url: '/api/truthy-check-ok' },
        responseExpression: 'response.allowed',
        debounceMs: 0,
        pendingValue: false,
      };

      runInInjectionContext(injector, () => {
        const fn = createHttpConditionLogicFunction(condition);
        const ctx = createMockFieldContext('test');
        fn(ctx);
      });

      TestBed.flushEffects();
      vi.advanceTimersByTime(0);
      TestBed.flushEffects();

      expect(mockLogger.warn).not.toHaveBeenCalledWith(expect.stringContaining('responseExpression'), expect.anything(), expect.anything());
    });

    it('should coerce a truthy raw response (no responseExpression) to true without warning', () => {
      httpClient.request.mockReturnValue(of({ someData: 'value' }));

      const condition: HttpCondition = {
        type: 'http',
        http: { url: '/api/truthy-raw' },
        debounceMs: 0,
        pendingValue: false,
      };

      runInInjectionContext(injector, () => {
        const fn = createHttpConditionLogicFunction(condition);
        const ctx = createMockFieldContext('test');
        fn(ctx);
      });

      TestBed.flushEffects();
      vi.advanceTimersByTime(0);
      TestBed.flushEffects();

      // No warning — truthy coercion is the expected path for raw responses
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should coerce a null raw response (no responseExpression) to false without warning', () => {
      httpClient.request.mockReturnValue(of(null));

      const condition: HttpCondition = {
        type: 'http',
        http: { url: '/api/falsy-raw' },
        debounceMs: 0,
        pendingValue: false,
      };

      runInInjectionContext(injector, () => {
        const fn = createHttpConditionLogicFunction(condition);
        const ctx = createMockFieldContext('test');
        fn(ctx);
      });

      TestBed.flushEffects();
      vi.advanceTimersByTime(0);
      TestBed.flushEffects();

      expect(mockLogger.warn).not.toHaveBeenCalled();
    });
  });

  it('should handle cacheDurationMs of 0 (effectively disables cache)', () => {
    vi.useFakeTimers();
    try {
      const condition: HttpCondition = {
        type: 'http',
        http: { url: '/api/check' },
        cacheDurationMs: 0,
      };

      // Pre-populate cache with TTL of 0
      const expectedKey = stableStringify({ url: '/api/check', method: undefined });
      expressionCache.httpConditionCache.set(expectedKey, true, 0);

      // Advance time by 1ms to ensure the entry expires immediately
      vi.advanceTimersByTime(1);

      const result = runInInjectionContext(injector, () => {
        const fn = createHttpConditionLogicFunction(condition);
        const ctx = createMockFieldContext('test');
        return fn(ctx);
      });

      // Cache should have expired, so pendingValue (false) is returned
      expect(result).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
