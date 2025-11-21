import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { FieldContext } from '@angular/forms/signals';
import { vi } from 'vitest';
import { ConditionalExpression } from '../../models';
import { FieldContextRegistryService, FunctionRegistryService, RootFormRegistryService } from '../registry';
import { createLogicFunction } from './logic-function-factory';

describe('logic-function-factory', () => {
  let functionRegistry: FunctionRegistryService;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService],
    });

    functionRegistry = TestBed.inject(FunctionRegistryService);
    injector = TestBed.inject(Injector);
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
        // Set up the root form registry with mock data
        const rootFormRegistry = TestBed.inject(RootFormRegistryService);

        // Create a mock FieldTree that returns mock form data
        const formValueObj = customFormValue || { username: 'test', email: 'test@example.com' };
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

        rootFormRegistry.registerRootForm(mockRootField);

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
          expression: 'typeof fieldValue === "string" && fieldValue.length > 2',
        };

        const result = runLogicFunctionTest(expression, 'test');
        expect(result).toBe(true);
      });

      it('should handle JavaScript expression errors gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

        // Test with an expression that causes a parsing error
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'invalid @@ syntax',
        };

        const result = runLogicFunctionTest(expression, 'test');
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
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'nonExistentFunction',
        };

        const result = runLogicFunctionTest(expression, 'test');
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

        const result = runLogicFunctionTest(expression, 'test');
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

          const result = runLogicFunctionTest(expression, value);
          expect(result).toBe(true);
        });
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
  });
});
