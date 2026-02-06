import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { FieldContext } from '@angular/forms/signals';
import { vi } from 'vitest';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from '../registry';
import { FormStateManager } from '../../state/form-state-manager';
import { createLogicFunction } from './logic-function-factory';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { createMockLogger, MockLogger } from '../../../../testing/src/mock-logger';

describe('logic-function-factory', () => {
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  let functionRegistry: FunctionRegistryService;
  let injector: Injector;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = createMockLogger();

    TestBed.configureTestingModule({
      providers: [
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        { provide: DynamicFormLogger, useValue: mockLogger },
      ],
    });

    functionRegistry = TestBed.inject(FunctionRegistryService);
    injector = TestBed.inject(Injector);

    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('createLogicFunction', () => {
    function createMockFieldContext<T>(value: T, mockField?: any, mockValueOf?: (path: any) => any): FieldContext<T> {
      const defaultValueOf = () => ({ username: 'test', email: 'test@example.com' });

      return {
        value: signal(value),
        field: mockField || { parent: null },
        valueOf: mockValueOf || defaultValueOf,
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

    function runLogicFunctionTest<T>(
      expression: ConditionalExpression,
      fieldValue: T,
      mockValueOf?: (path: any) => any,
      customFormValue?: any,
    ): boolean {
      return runInInjectionContext(injector, () => {
        const formValueObj = customFormValue || { username: 'test', email: 'test@example.com' };

        // Set the entity value on the mock DynamicForm
        mockEntity.set(formValueObj);

        // Also set a mock FieldTree
        const mockFormValue = signal(formValueObj);
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

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext(fieldValue, undefined, mockValueOf);
        return logicFn(fieldContext);
      });
    }

    describe('fieldValue expressions', () => {
      it('should create logic function that evaluates field value conditions', () => {
        // The fieldValue expression looks up a field in the form, not the current field value
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'username',
          operator: 'equals',
          value: 'test', // Expected value from mock form data
        };

        const result = runLogicFunctionTest(expression, 'someValue');
        expect(result).toBe(true);
      });

      it('should handle different field value comparisons', () => {
        // Now that formValue is properly accessed, we can test against actual form field values
        const testCases = [
          { fieldPath: 'username', operator: 'equals', expected: 'test', result: true },
          { fieldPath: 'username', operator: 'notEquals', expected: 'other', result: true },
          { fieldPath: 'email', operator: 'equals', expected: 'test@example.com', result: true },
          { fieldPath: 'nonExistentField', operator: 'equals', expected: undefined, result: true },
        ];

        testCases.forEach(({ fieldPath, operator, expected, result }) => {
          const expression: ConditionalExpression = {
            type: 'fieldValue',
            fieldPath,
            operator: operator as any,
            value: expected,
          };

          const testResult = runLogicFunctionTest(expression, 'someValue');
          expect(testResult).toBe(result);
        });
      });
    });

    describe('formValue expressions', () => {
      it('should create logic function that evaluates form value conditions', () => {
        const mockFormValue = { username: 'test', email: 'test@example.com' };
        const expression: ConditionalExpression = {
          type: 'formValue',
          operator: 'equals',
          value: mockFormValue,
        };

        const mockValueOf = vi.fn().mockReturnValue(mockFormValue);
        const result = runLogicFunctionTest(expression, 'value', mockValueOf, mockFormValue);
        // compareValues uses === which returns true when comparing the same object instance
        expect(result).toBe(true);
      });
    });

    describe('javascript expressions', () => {
      it('should create logic function that evaluates JavaScript expressions', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'fieldValue === "test"',
        };

        const result = runLogicFunctionTest(expression, 'test');
        expect(result).toBe(true);
      });

      it('should handle complex JavaScript expressions', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'fieldValue && fieldValue.length > 2',
        };

        const result = runLogicFunctionTest(expression, 'test');
        expect(result).toBe(true);
      });

      it('should handle JavaScript expression errors gracefully', () => {
        // Test with an expression that causes a parsing error
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'invalid @@ syntax',
        };

        const result = runLogicFunctionTest(expression, 'test');
        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe('custom expressions', () => {
      it('should create logic function that evaluates custom functions', () => {
        const mockCustomFn = vi.fn().mockReturnValue(true);
        functionRegistry.registerCustomFunction('validateField', mockCustomFn);

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'validateField',
        };

        const result = runLogicFunctionTest(expression, 'test');
        expect(result).toBe(true);
        expect(mockCustomFn).toHaveBeenCalledWith(
          expect.objectContaining({
            fieldValue: 'test',
            formValue: { username: 'test', email: 'test@example.com' },
            fieldPath: '',
            customFunctions: expect.objectContaining({
              validateField: mockCustomFn,
            }),
          }),
        );
      });

      it('should handle missing custom functions', () => {
        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'nonExistentFunction',
        };

        const result = runLogicFunctionTest(expression, 'test');
        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalledWith('Custom function not found:', 'nonExistentFunction');
      });

      it('should handle custom function execution errors', () => {
        const throwingFn = vi.fn(() => {
          throw new Error('Custom function error');
        });
        functionRegistry.registerCustomFunction('throwingFn', throwingFn);

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'throwingFn',
        };

        const result = runLogicFunctionTest(expression, 'test');
        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalledWith('Error executing custom function:', 'throwingFn', expect.any(Error));
      });
    });

    describe('return type verification', () => {
      it('should return a LogicFn that returns boolean', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'test',
          operator: 'equals',
          value: undefined, // Because formValue is {} and lookup returns undefined
        };

        const result = runLogicFunctionTest(expression, 'test');
        expect(typeof result).toBe('boolean');
        expect(result).toBe(true);
      });
    });

    describe('context building', () => {
      it('should build evaluation context correctly', () => {
        const mockCustomFn = vi.fn((context) => {
          // Verify the context structure and that form values are properly accessible
          expect(context).toHaveProperty('fieldValue');
          expect(context).toHaveProperty('formValue');
          expect(context).toHaveProperty('fieldPath');
          expect(context).toHaveProperty('customFunctions');
          expect(typeof context.fieldValue).toBe('string');
          expect(typeof context.formValue).toBe('object');
          expect(typeof context.fieldPath).toBe('string');
          expect(typeof context.customFunctions).toBe('object');
          // Verify that formValue contains the expected mock data
          expect(context.formValue).toEqual({ username: 'test', email: 'test@example.com' });
          return true;
        });

        functionRegistry.registerCustomFunction('contextChecker', mockCustomFn);

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'contextChecker',
        };

        const result = runLogicFunctionTest(expression, 'test value');
        expect(result).toBe(true);
        expect(mockCustomFn).toHaveBeenCalled();
      });

      it('should handle different field value types', () => {
        // Test null check
        const nullExpression: ConditionalExpression = {
          type: 'javascript',
          expression: 'fieldValue === null',
        };
        expect(runLogicFunctionTest(nullExpression, null)).toBe(true);
        expect(runLogicFunctionTest(nullExpression, 'string')).toBe(false);

        // Test undefined check
        const undefinedExpression: ConditionalExpression = {
          type: 'javascript',
          expression: 'fieldValue === undefined',
        };
        expect(runLogicFunctionTest(undefinedExpression, undefined)).toBe(true);
        expect(runLogicFunctionTest(undefinedExpression, null)).toBe(false);

        // Test truthy check (works for strings, numbers, objects)
        const truthyExpression: ConditionalExpression = {
          type: 'javascript',
          expression: '!!fieldValue',
        };
        expect(runLogicFunctionTest(truthyExpression, 'string')).toBe(true);
        expect(runLogicFunctionTest(truthyExpression, 123)).toBe(true);
        expect(runLogicFunctionTest(truthyExpression, {})).toBe(true);
        expect(runLogicFunctionTest(truthyExpression, [])).toBe(true);
        expect(runLogicFunctionTest(truthyExpression, null)).toBe(false);
        expect(runLogicFunctionTest(truthyExpression, undefined)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle invalid expression types', () => {
        const expression: ConditionalExpression = {
          type: 'invalidType' as any,
        };

        const result = runLogicFunctionTest(expression, 'test');
        expect(result).toBe(false);
      });

      it('should handle empty expressions', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
        };

        const result = runLogicFunctionTest(expression, 'test');
        expect(result).toBe(false);
      });
    });

    describe('caching behavior', () => {
      it('should return the same function instance for identical expressions', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'username',
          operator: 'equals',
          value: 'test',
        };

        let fn1: unknown;
        let fn2: unknown;

        runInInjectionContext(injector, () => {
          fn1 = createLogicFunction(expression);
          fn2 = createLogicFunction(expression);
        });

        expect(fn1).toBe(fn2);
      });

      it('should return the same function for equivalent expressions with different key order', () => {
        // Create two expressions with same content but different key order
        const expression1: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'username',
          operator: 'equals',
          value: 'test',
        };

        // Manually create object with different insertion order
        const expression2 = {} as ConditionalExpression;
        (expression2 as Record<string, unknown>)['value'] = 'test';
        (expression2 as Record<string, unknown>)['operator'] = 'equals';
        (expression2 as Record<string, unknown>)['fieldPath'] = 'username';
        (expression2 as Record<string, unknown>)['type'] = 'fieldValue';

        let fn1: unknown;
        let fn2: unknown;

        runInInjectionContext(injector, () => {
          fn1 = createLogicFunction(expression1);
          fn2 = createLogicFunction(expression2);
        });

        expect(fn1).toBe(fn2);
      });

      it('should return different functions for different expressions', () => {
        const expression1: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'username',
          operator: 'equals',
          value: 'test1',
        };

        const expression2: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'username',
          operator: 'equals',
          value: 'test2',
        };

        let fn1: unknown;
        let fn2: unknown;

        runInInjectionContext(injector, () => {
          fn1 = createLogicFunction(expression1);
          fn2 = createLogicFunction(expression2);
        });

        expect(fn1).not.toBe(fn2);
      });

      it('should handle nested expressions in cache key', () => {
        const expression: ConditionalExpression = {
          type: 'and',
          conditions: [
            { type: 'fieldValue', fieldPath: 'a', operator: 'equals', value: 1 },
            { type: 'fieldValue', fieldPath: 'b', operator: 'equals', value: 2 },
          ],
        };

        let fn1: unknown;
        let fn2: unknown;

        runInInjectionContext(injector, () => {
          fn1 = createLogicFunction(expression);
          fn2 = createLogicFunction(expression);
        });

        expect(fn1).toBe(fn2);
      });
    });
  });
});
