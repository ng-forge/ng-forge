import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { FieldContext } from '@angular/forms/signals';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AsyncCondition } from '../../models/expressions/conditional-expression';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { RootFormRegistryService } from '../registry/root-form-registry.service';
import { FormStateManager } from '../../state/form-state-manager';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { createMockLogger, MockLogger } from '../../../../testing/src/mock-logger';
import { createDeprecationWarningTracker, DEPRECATION_WARNING_TRACKER } from '../../utils/deprecation-warning-tracker';
import { createAsyncConditionLogicFunction } from './async-condition-logic-function';
import { AsyncConditionFunctionCacheService } from './async-condition-function-cache.service';
import { LogicFunctionCacheService } from './logic-function-cache.service';
import { DynamicValueFunctionCacheService } from '../values/dynamic-value-function-cache.service';
import { stableStringify } from '../../utils/stable-stringify';

describe('createAsyncConditionLogicFunction', () => {
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  let injector: Injector;
  let mockLogger: MockLogger;
  let functionRegistry: FunctionRegistryService;

  beforeEach(() => {
    mockLogger = createMockLogger();

    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        { provide: DynamicFormLogger, useValue: mockLogger },
        { provide: DEPRECATION_WARNING_TRACKER, useFactory: createDeprecationWarningTracker },
        AsyncConditionFunctionCacheService,
        LogicFunctionCacheService,
        DynamicValueFunctionCacheService,
      ],
    });

    injector = TestBed.inject(Injector);
    functionRegistry = TestBed.inject(FunctionRegistryService);

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
    functionRegistry.registerAsyncConditionFunction('checkPermission', async () => true);

    const condition: AsyncCondition = {
      type: 'async',
      asyncFunctionName: 'checkPermission',
      pendingValue: false,
    };

    const result = runInInjectionContext(injector, () => {
      const fn = createAsyncConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      return fn(ctx);
    });

    expect(result).toBe(false);
  });

  it('should return pendingValue true when configured', () => {
    functionRegistry.registerAsyncConditionFunction('checkPermission', async () => true);

    const condition: AsyncCondition = {
      type: 'async',
      asyncFunctionName: 'checkPermission',
      pendingValue: true,
    };

    const result = runInInjectionContext(injector, () => {
      const fn = createAsyncConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      return fn(ctx);
    });

    expect(result).toBe(true);
  });

  it('should cache logic function for same condition', () => {
    functionRegistry.registerAsyncConditionFunction('checkPermission', async () => true);

    const condition: AsyncCondition = {
      type: 'async',
      asyncFunctionName: 'checkPermission',
    };

    const [fn1, fn2] = runInInjectionContext(injector, () => {
      return [createAsyncConditionLogicFunction(condition), createAsyncConditionLogicFunction(condition)];
    });

    expect(fn1).toBe(fn2);
  });

  it('should warn when async function is not registered', () => {
    // Don't register any function

    const condition: AsyncCondition = {
      type: 'async',
      asyncFunctionName: 'nonExistent',
      pendingValue: false,
    };

    const result = runInInjectionContext(injector, () => {
      const fn = createAsyncConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      return fn(ctx);
    });

    // Should return pendingValue since function is not found
    expect(result).toBe(false);
  });

  it('should default pendingValue to false', () => {
    functionRegistry.registerAsyncConditionFunction('checkPermission', async () => true);

    const condition: AsyncCondition = {
      type: 'async',
      asyncFunctionName: 'checkPermission',
      // No pendingValue specified
    };

    const result = runInInjectionContext(injector, () => {
      const fn = createAsyncConditionLogicFunction(condition);
      const ctx = createMockFieldContext('test');
      return fn(ctx);
    });

    expect(result).toBe(false);
  });
});
