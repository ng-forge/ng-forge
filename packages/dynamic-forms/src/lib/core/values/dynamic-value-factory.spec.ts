import { vi } from 'vitest';
import { FieldContext, FieldTree } from '@angular/forms/signals';
import { signal, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createDynamicValueFunction } from './dynamic-value-factory';
import { RootFormRegistryService, FieldContextRegistryService } from '../registry';
import { FormStateManager } from '../../state/form-state-manager';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { ConsoleLogger } from '../../providers/features/logger/console-logger';

describe('dynamic-value-factory', () => {
  let injector: Injector;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        FieldContextRegistryService,
        // Provide ConsoleLogger to enable logging in tests
        { provide: DynamicFormLogger, useValue: new ConsoleLogger() },
      ],
    });

    injector = TestBed.inject(Injector);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('createDynamicValueFunction', () => {
    function createMockFieldContext<T>(
      value: T,
      mockField?: Partial<FieldTree<T>>,
      mockValueOf?: (_path: unknown) => unknown,
      fieldKey?: string,
    ): FieldContext<T> {
      const defaultValueOf = () => ({ username: 'test', email: 'test@example.com' });

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
          mockEntity.set({ username: 'test', email: 'test@example.com' });
          const mockRootField = createMockFieldTree();
          mockFormSignal.set(mockRootField);
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
        mockEntity.set({ username: 'test', email: 'test@example.com' });
        const mockRootField = createMockFieldTree();
        mockFormSignal.set(mockRootField);

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
