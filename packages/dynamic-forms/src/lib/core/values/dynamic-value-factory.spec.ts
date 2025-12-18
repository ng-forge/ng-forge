import { vi } from 'vitest';
import { FieldContext, FieldTree } from '@angular/forms/signals';
import { signal, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createDynamicValueFunction } from './dynamic-value-factory';
import { RootFormRegistryService, FieldContextRegistryService } from '../registry';

describe('dynamic-value-factory', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService, FieldContextRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  describe('createDynamicValueFunction', () => {
    function createMockFieldContext<T>(
      value: T,
      mockField?: Partial<FieldTree<T>>,
      mockValueOf?: (path: any) => any,
      fieldKey?: string,
    ): FieldContext<T> {
      const defaultValueOf = (path: any) => ({ username: 'test', email: 'test@example.com' });

      const context = {
        value: signal(value),
        field: mockField as FieldTree<T>,
        valueOf: mockValueOf || defaultValueOf,
        stateOf: vi.fn(),
      } as any;

      // Add key as a signal (required for isChildFieldContext check)
      if (fieldKey) {
        context.key = signal(fieldKey);
      }

      return context;
    }

    function createMockFieldTree(parentField?: FieldTree<any>, key?: string | number): FieldTree<any> {
      // Create a mock FieldTree that returns mock form data
      const mockFormValue = signal({ username: 'test', email: 'test@example.com' });
      const mockRootField = Object.assign(
        () => ({
          value: mockFormValue,
          valid: signal(true),
          errors: signal(null),
          touched: signal(false),
          dirty: signal(false),
        }),
        {
          formValue: mockFormValue,
          parent: parentField,
          key,
        },
      ) as any;

      return mockRootField;
    }

    function runDynamicValueFunctionTest<TValue, TReturn>(
      expression: string,
      fieldValue: TValue,
      mockField?: Partial<FieldTree<TValue>>,
      mockValueOf?: (path: unknown) => unknown,
      setupRoot = true,
      fieldKey?: string,
    ): TReturn {
      return runInInjectionContext(injector, () => {
        // Set up the root form registry with mock data if needed
        if (setupRoot) {
          // Create mock form value signal and register BEFORE creating dynamic function
          const mockFormValue = signal({ username: 'test', email: 'test@example.com' });
          rootFormRegistry.registerFormValueSignal(mockFormValue);

          const mockRootField = createMockFieldTree();
          rootFormRegistry.registerRootForm(mockRootField);
        }

        const dynamicFn = createDynamicValueFunction<TValue, TReturn>(expression);
        const fieldContext = createMockFieldContext(fieldValue, mockField, mockValueOf, fieldKey);
        return dynamicFn(fieldContext);
      });
    }

    it('should create a function that evaluates simple expressions', () => {
      const expression = 'fieldValue === "test"';

      const result = runInInjectionContext(injector, () => {
        const dynamicFn = createDynamicValueFunction<string, boolean>(expression);
        const fieldContext = createMockFieldContext('test');
        return dynamicFn(fieldContext);
      });

      expect(result).toBe(true);
    });

    it('should access form values in expressions', () => {
      const expression = 'formValue.username === "test"';

      const result = runInInjectionContext(injector, () => {
        // Register the form value signal BEFORE creating the dynamic function
        const mockFormValue = signal({ username: 'test', email: 'test@example.com' });
        rootFormRegistry.registerFormValueSignal(mockFormValue as any);

        // Also set up the root form registry with mock data
        const mockRootField = createMockFieldTree();
        rootFormRegistry.registerRootForm(mockRootField);

        const dynamicFn = createDynamicValueFunction<string, boolean>(expression);

        const fieldContext = createMockFieldContext('test@example.com', mockRootField);

        return dynamicFn(fieldContext);
      });

      expect(result).toBe(true);
    });

    it('should provide field key as path in context', () => {
      // fieldPath is the field's key (not full path), used to identify the field
      const expression = 'fieldPath === "email"';

      const rootField = createMockFieldTree();
      const userField = createMockFieldTree(rootField, 'user');
      const emailField = createMockFieldTree(userField, 'email');

      const result = runDynamicValueFunctionTest(expression, 'test@example.com', emailField, undefined, true, 'email');
      expect(result).toBe(true);
    });

    it('should use field key as path for nested fields', () => {
      // fieldPath is the field's key, even for deeply nested fields
      const expression = 'fieldPath === "field"';

      const rootField = createMockFieldTree();
      const formField = createMockFieldTree(rootField, 'form');
      const sectionField = createMockFieldTree(formField, 'section');
      const targetField = createMockFieldTree(sectionField, 'field');

      const result = runDynamicValueFunctionTest(expression, 'value', targetField, undefined, true, 'field');
      expect(result).toBe(true);
    });

    it('should return empty string for root field path', () => {
      const expression = 'fieldPath === ""';

      const rootField = createMockFieldTree(); // No parent
      const result = runDynamicValueFunctionTest(expression, 'value', rootField);

      expect(result).toBe(true);
    });

    it('should handle expressions with complex logic', () => {
      const expression = 'fieldValue.length > 3 && formValue.username !== null';

      const rootField = createMockFieldTree();
      const result = runDynamicValueFunctionTest(expression, 'testing', rootField);

      expect(result).toBe(true);
    });

    it('should handle expression errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

      const expression = 'invalidExpression.does.not.exist()';
      const result = runDynamicValueFunctionTest<string, string>(expression, 'test');

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return calculated values from expressions', () => {
      const expression = 'fieldValue.length + formValue.username.length';

      const rootField = createMockFieldTree();
      const mockValueOf = vi.fn().mockReturnValue({ username: 'test' });
      const result = runDynamicValueFunctionTest<string, number>(expression, 'hello', rootField, mockValueOf);

      expect(result).toBe(9); // 5 + 4 ("hello".length + "test".length)
    });

    it('should handle different return types', () => {
      const testCases = [
        { expression: '"computed string"', expected: 'computed string' },
        { expression: '42', expected: 42 },
        { expression: 'true', expected: true },
        // Note: Object literals are not supported by the secure parser for security reasons
        { expression: '[1, 2, 3]', expected: [1, 2, 3] },
      ];

      testCases.forEach(({ expression, expected }) => {
        const result = runDynamicValueFunctionTest(expression, 'test');
        expect(result).toEqual(expected);
      });
    });

    it('should handle field trees without parents correctly', () => {
      const expression = 'formValue.username === "test"';

      // Create a field with no parent (root field)
      const rootField = createMockFieldTree();

      const result = runDynamicValueFunctionTest<string, boolean>(expression, 'value', rootField);

      expect(result).toBe(true);
    });

    it('should handle missing root field gracefully', () => {
      const expression = 'formValue.username || "default"';

      const result = runDynamicValueFunctionTest<string, string>(expression, 'test', null as any, undefined, false);

      expect(result).toBe('default'); // Should fall back to empty object for formValue
    });
  });
});
