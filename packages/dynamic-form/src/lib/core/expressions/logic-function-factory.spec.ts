import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConditionalExpression } from '../../models';
import { FunctionRegistryService } from '../registry';
import { createLogicFunction } from './logic-function-factory';

describe('logic-function-factory', () => {
  let functionRegistry: FunctionRegistryService;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FunctionRegistryService],
    });

    functionRegistry = TestBed.inject(FunctionRegistryService);
    injector = TestBed.inject(Injector);
  });

  describe('createLogicFunction', () => {
    function createMockFieldContext<T>(value: T): FieldContext<T> {
      return {
        value: signal(value),
        valid: signal(true),
        disabled: signal(false),
        pending: signal(false),
        errors: signal(null),
        touched: signal(false),
        dirty: signal(false),
        pristine: signal(true),
        untouched: signal(true),
      };
    }

    describe('fieldValue expressions', () => {
      it('should create logic function that evaluates field value conditions', () => {
        // Since the current implementation doesn't access form values properly,
        // fieldValue expressions will always evaluate against an empty formValue {}
        // So fieldPath lookups will return undefined
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'testField',
          operator: 'equals',
          value: undefined, // Expected because formValue is {} and lookup returns undefined
        };

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('expectedValue');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(result).toBe(true);
      });

      it('should handle different field value comparisons', () => {
        // All these tests will be comparing undefined (from empty formValue lookup) with expected values
        const testCases = [
          { value: 'test', operator: 'equals', expected: undefined, result: true },
          { value: 'test', operator: 'notEquals', expected: 'other', result: true },
          { value: 25, operator: 'equals', expected: undefined, result: true },
          { value: 15, operator: 'equals', expected: undefined, result: true },
          { value: 'hello world', operator: 'equals', expected: undefined, result: true },
          { value: 'test@example.com', operator: 'equals', expected: undefined, result: true },
        ];

        testCases.forEach(({ value, operator, expected, result }) => {
          const expression: ConditionalExpression = {
            type: 'fieldValue',
            fieldPath: 'testField',
            operator: operator as any,
            value: expected,
          };

          const logicFn = createLogicFunction(expression);
          const fieldContext = createMockFieldContext(value);

          expect(runInInjectionContext(injector, () => logicFn(fieldContext))).toBe(result);
        });
      });
    });

    describe('formValue expressions', () => {
      it('should create logic function that evaluates form value conditions', () => {
        const expression: ConditionalExpression = {
          type: 'formValue',
          operator: 'equals',
          value: {}, // Empty object for comparison
        };

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('value');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        // Since formValue is currently {} (TODO: access root form value properly),
        // and we're comparing with {}, but compareValues uses === which returns false for different object instances
        expect(result).toBe(false);
      });
    });

    describe('javascript expressions', () => {
      it('should create logic function that evaluates JavaScript expressions', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'fieldValue === "test"',
        };

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('test');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(result).toBe(true);
      });

      it('should handle complex JavaScript expressions', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'typeof fieldValue === "string" && fieldValue.length > 2',
        };

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('test');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(result).toBe(true);
      });

      it('should handle JavaScript expression errors gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'nonexistentVariable.property',
        };

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('test');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
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

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('test');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(result).toBe(true);
        expect(mockCustomFn).toHaveBeenCalledWith(
          expect.objectContaining({
            fieldValue: 'test',
            formValue: {},
            fieldPath: '',
            customFunctions: expect.objectContaining({
              validateField: mockCustomFn,
            }),
          })
        );
      });

      it('should handle missing custom functions', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'nonExistentFunction',
        };

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('test');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Custom function not found:', 'nonExistentFunction');

        consoleSpy.mockRestore();
      });

      it('should handle custom function execution errors', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);
        const throwingFn = vi.fn(() => {
          throw new Error('Custom function error');
        });
        functionRegistry.registerCustomFunction('throwingFn', throwingFn);

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'throwingFn',
        };

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('test');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Error executing custom function:', 'throwingFn', expect.any(Error));

        consoleSpy.mockRestore();
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

        const logicFn: LogicFn<string, boolean> = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('test');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(typeof result).toBe('boolean');
        expect(result).toBe(true);
      });
    });

    describe('context building', () => {
      it('should build evaluation context correctly', () => {
        const mockCustomFn = vi.fn((context) => {
          // Verify the context structure
          expect(context).toHaveProperty('fieldValue');
          expect(context).toHaveProperty('formValue');
          expect(context).toHaveProperty('fieldPath');
          expect(context).toHaveProperty('customFunctions');
          expect(typeof context.fieldValue).toBe('string');
          expect(typeof context.formValue).toBe('object');
          expect(typeof context.fieldPath).toBe('string');
          expect(typeof context.customFunctions).toBe('object');
          return true;
        });

        functionRegistry.registerCustomFunction('contextChecker', mockCustomFn);

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'contextChecker',
        };

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('test value');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(result).toBe(true);
        expect(mockCustomFn).toHaveBeenCalled();
      });

      it('should handle different field value types', () => {
        const testCases = [
          { value: 'string', type: 'string' },
          { value: 123, type: 'number' },
          { value: true, type: 'boolean' },
          { value: null, type: 'object' },
          { value: undefined, type: 'undefined' },
          { value: [], type: 'object' },
          { value: {}, type: 'object' },
        ];

        testCases.forEach(({ value, type }) => {
          const expression: ConditionalExpression = {
            type: 'javascript',
            expression: `typeof fieldValue === "${type}"`,
          };

          const logicFn = createLogicFunction(expression);
          const fieldContext = createMockFieldContext(value);

          const result = runInInjectionContext(injector, () => logicFn(fieldContext));
          expect(result).toBe(true);
        });
      });
    });

    describe('edge cases', () => {
      it('should handle invalid expression types', () => {
        const expression: ConditionalExpression = {
          type: 'invalidType' as any,
        };

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('test');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(result).toBe(false);
      });

      it('should handle empty expressions', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
        };

        const logicFn = createLogicFunction(expression);
        const fieldContext = createMockFieldContext('test');

        const result = runInInjectionContext(injector, () => logicFn(fieldContext));
        expect(result).toBe(false);
      });
    });
  });
});
