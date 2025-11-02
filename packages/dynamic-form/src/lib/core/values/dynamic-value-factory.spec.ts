import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FieldContext, FieldTree } from '@angular/forms/signals';
import { signal, Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createDynamicValueFunction } from './dynamic-value-factory';
import { RootFormRegistryService, FieldContextRegistryService } from '../registry';

describe('dynamic-value-factory', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;
  let fieldContextRegistry: FieldContextRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RootFormRegistryService,
        FieldContextRegistryService,
      ],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
    fieldContextRegistry = TestBed.inject(FieldContextRegistryService);
  });

  describe('createDynamicValueFunction', () => {
    function createMockFieldContext<T>(
      value: T,
      mockField?: Partial<FieldTree<T>>,
      mockValueOf?: (path: any) => any,
      fieldKey?: string
    ): FieldContext<T> {
      const defaultValueOf = (path: any) => ({ username: 'test', email: 'test@example.com' });
      
      const context = {
        value: signal(value),
        field: mockField as FieldTree<T>,
        valueOf: mockValueOf || defaultValueOf,
        stateOf: vi.fn(),
      } as any;
      
      // Add key function if fieldKey is provided
      if (fieldKey) {
        context.key = () => fieldKey;
      }
      
      return context;
    }

    function createMockFieldTree(parentField?: FieldTree<any>, key?: string | number): FieldTree<any> {
      return {
        parent: parentField,
        key,
      } as any;
    }

    function runDynamicValueFunctionTest<TValue, TReturn>(
      expression: string,
      fieldValue: TValue,
      mockField?: Partial<FieldTree<TValue>>,
      mockValueOf?: (path: any) => any,
      setupRoot = true,
      fieldKey?: string,
      expectedPath?: string
    ): TReturn {
      return runInInjectionContext(injector, () => {
        // Set up the root form registry with mock data if needed
        if (setupRoot) {
          const mockRootField = createMockFieldTree();
          rootFormRegistry.registerRootForm(mockRootField);
          
          // Register field path if provided
          if (fieldKey && expectedPath) {
            fieldContextRegistry.registerFieldPath(fieldKey, expectedPath.replace(`.${fieldKey}`, ''));
          }
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
        // Set up the root form registry with mock data
        const mockRootField = createMockFieldTree();
        rootFormRegistry.registerRootForm(mockRootField);
        
        const dynamicFn = createDynamicValueFunction<string, boolean>(expression);
        
        const mockValueOf = vi.fn().mockReturnValue({ username: 'test', email: 'test@example.com' });
        const fieldContext = createMockFieldContext('test@example.com', mockRootField, mockValueOf);
        
        const result = dynamicFn(fieldContext);
        
        expect(mockValueOf).toHaveBeenCalledWith(mockRootField);
        return result;
      });
      
      expect(result).toBe(true);
    });

    it('should provide field path in context', () => {
      const expression = 'fieldPath === "user.email"';
      
      const rootField = createMockFieldTree();
      const userField = createMockFieldTree(rootField, 'user');
      const emailField = createMockFieldTree(userField, 'email');
      
      const result = runDynamicValueFunctionTest(
        expression, 
        'test@example.com', 
        emailField, 
        undefined, 
        true, 
        'email', 
        'user.email'
      );
      expect(result).toBe(true);
    });

    it('should handle nested field paths correctly', () => {
      const expression = 'fieldPath === "form.section.field"';
      
      const rootField = createMockFieldTree();
      const formField = createMockFieldTree(rootField, 'form');
      const sectionField = createMockFieldTree(formField, 'section');
      const targetField = createMockFieldTree(sectionField, 'field');
      
      const result = runDynamicValueFunctionTest(
        expression, 
        'value', 
        targetField, 
        undefined, 
        true, 
        'field', 
        'form.section.field'
      );
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
        { expression: '{ result: "object" }', expected: { result: 'object' } },
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
      const mockValueOf = vi.fn().mockReturnValue({ username: 'test' });
      
      const result = runDynamicValueFunctionTest<string, boolean>(expression, 'value', rootField, mockValueOf);
      
      expect(result).toBe(true);
      expect(mockValueOf).toHaveBeenCalledWith(rootField);
    });

    it('should handle missing root field gracefully', () => {
      const expression = 'formValue.username || "default"';
      
      const result = runDynamicValueFunctionTest<string, string>(expression, 'test', null as any, undefined, false);
      
      expect(result).toBe('default'); // Should fall back to empty object for formValue
    });
  });
});