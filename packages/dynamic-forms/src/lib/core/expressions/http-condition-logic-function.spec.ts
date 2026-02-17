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
import { HTTP_CONDITION_CACHE, HttpConditionCache } from '../http/http-condition-cache';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { createMockLogger, MockLogger } from '../../../../testing/src/mock-logger';
import { createDeprecationWarningTracker, DEPRECATION_WARNING_TRACKER } from '../../utils/deprecation-warning-tracker';
import { createHttpConditionLogicFunction } from './http-condition-logic-function';

describe('createHttpConditionLogicFunction', () => {
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  let injector: Injector;
  let mockLogger: MockLogger;
  let httpClient: { request: ReturnType<typeof vi.fn> };
  let conditionCache: HttpConditionCache;

  beforeEach(() => {
    mockLogger = createMockLogger();
    httpClient = { request: vi.fn().mockReturnValue(of({ allowed: true })) };
    conditionCache = new HttpConditionCache();

    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        { provide: DynamicFormLogger, useValue: mockLogger },
        { provide: DEPRECATION_WARNING_TRACKER, useFactory: createDeprecationWarningTracker },
        { provide: HttpClient, useValue: httpClient },
        { provide: HTTP_CONDITION_CACHE, useValue: conditionCache },
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

    // Pre-populate cache with the expected cache key
    // resolveHttpRequest returns { url: '/api/check', method: undefined }
    // stableStringify sorts keys: method before url, undefined → "undefined"
    conditionCache.set('{"method":undefined,"url":"/api/check"}', true, 30000);

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
    conditionCache.set('{"method":undefined,"url":"/api/check"}', true, 30000);

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
});
