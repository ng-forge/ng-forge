import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FieldContextRegistryService } from './field-context-registry.service';
import { RootFormRegistryService } from './root-form-registry.service';
import { FieldContext } from '@angular/forms/signals';

describe('FieldContextRegistryService', () => {
  let service: FieldContextRegistryService;
  let mockRootFormRegistry: RootFormRegistryService;

  function createMockFieldContext<T>(value: T): FieldContext<T> {
    return {
      value: vi.fn(() => value),
      touched: vi.fn(() => false),
      valid: vi.fn(() => true),
    } as unknown as FieldContext<T>;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FieldContextRegistryService, RootFormRegistryService],
    });

    service = TestBed.inject(FieldContextRegistryService);
    mockRootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  describe('createEvaluationContext', () => {
    it('should create basic evaluation context', () => {
      const fieldContext = createMockFieldContext('test value');

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldValue).toBe('test value');
      expect(result.formValue).toEqual({});
      expect(result.fieldPath).toBe('');
      expect(result.customFunctions).toEqual({});
    });

    it('should include field value in context', () => {
      const fieldContext = createMockFieldContext(42);

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldValue).toBe(42);
    });

    it('should handle null field value', () => {
      const fieldContext = createMockFieldContext(null);

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldValue).toBe(null);
    });

    it('should handle undefined field value', () => {
      const fieldContext = createMockFieldContext(undefined);

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldValue).toBe(undefined);
    });

    it('should handle object field value', () => {
      const value = { name: 'John', age: 30 };
      const fieldContext = createMockFieldContext(value);

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldValue).toEqual(value);
    });

    it('should handle array field value', () => {
      const value = [1, 2, 3];
      const fieldContext = createMockFieldContext(value);

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldValue).toEqual(value);
    });
  });

  describe('createEvaluationContext with root form', () => {
    it('should include root form value', () => {
      const formValue = { name: 'Alice', email: 'alice@example.com' };
      const mockRootForm = vi.fn(() => ({
        value: vi.fn(() => formValue),
      }));

      mockRootFormRegistry.registerRootForm(mockRootForm as any);

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.formValue).toEqual(formValue);
    });

    it('should handle root form with empty value', () => {
      const mockRootForm = vi.fn(() => ({
        value: vi.fn(() => ({})),
      }));

      mockRootFormRegistry.registerRootForm(mockRootForm as any);

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.formValue).toEqual({});
    });

    it('should handle root form with null value', () => {
      const mockRootForm = vi.fn(() => ({
        value: vi.fn(() => null),
      }));

      mockRootFormRegistry.registerRootForm(mockRootForm as any);

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.formValue).toEqual({});
    });

    it('should handle root form with array value', () => {
      const mockRootForm = vi.fn(() => ({
        value: vi.fn(() => [1, 2, 3]),
      }));

      mockRootFormRegistry.registerRootForm(mockRootForm as any);

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.formValue).toEqual({});
    });

    it('should handle root form that throws error', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const mockRootForm = vi.fn(() => {
        throw new Error('Test error');
      });

      mockRootFormRegistry.registerRootForm(mockRootForm as any);

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.formValue).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to get root form value from registry:', expect.any(Error));

      consoleWarnSpy.mockRestore();
    });

    it('should handle root form value().throw error', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const mockRootForm = vi.fn(() => ({
        value: vi.fn(() => {
          throw new Error('Value error');
        }),
      }));

      mockRootFormRegistry.registerRootForm(mockRootForm as any);

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.formValue).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should use custom form id', () => {
      const formValue = { custom: 'data' };
      const mockRootForm = vi.fn(() => ({
        value: vi.fn(() => formValue),
      }));

      mockRootFormRegistry.registerRootForm(mockRootForm as any, 'customForm');

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext, undefined, 'customForm');

      expect(result.formValue).toEqual(formValue);
    });
  });

  describe('createEvaluationContext with custom functions', () => {
    it('should include custom functions', () => {
      const customFunctions = {
        add: (ctx: any) => ctx.fieldValue + 10,
        multiply: (ctx: any) => ctx.fieldValue * 2,
      };

      const fieldContext = createMockFieldContext(5);
      const result = service.createEvaluationContext(fieldContext, customFunctions);

      expect(result.customFunctions).toEqual(customFunctions);
      expect(result.customFunctions.add).toBe(customFunctions.add);
      expect(result.customFunctions.multiply).toBe(customFunctions.multiply);
    });

    it('should use empty object when custom functions not provided', () => {
      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.customFunctions).toEqual({});
    });

    it('should handle undefined custom functions', () => {
      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext, undefined);

      expect(result.customFunctions).toEqual({});
    });
  });

  describe('createEvaluationContext with field path', () => {
    it('should extract field path from context', () => {
      const fieldContext: any = createMockFieldContext('test');
      fieldContext.key = vi.fn(() => 'email');

      mockRootFormRegistry.registerFormContext({ fieldPaths: { email: 'user.email' } });

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldPath).toBe('user.email');
    });

    it('should use key as path when no field paths registered', () => {
      const fieldContext: any = createMockFieldContext('test');
      fieldContext.key = vi.fn(() => 'email');

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldPath).toBe('email');
    });

    it('should return empty string when field has no key', () => {
      const fieldContext = createMockFieldContext('test');

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldPath).toBe('');
    });

    it('should handle field key that throws error', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const fieldContext: any = createMockFieldContext('test');
      fieldContext.key = vi.fn(() => {
        throw new Error('Key error');
      });

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldPath).toBe('');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Unable to extract field key:', expect.any(Error));

      consoleWarnSpy.mockRestore();
    });

    it('should use custom form id for field paths', () => {
      const fieldContext: any = createMockFieldContext('test');
      fieldContext.key = vi.fn(() => 'name');

      mockRootFormRegistry.registerFormContext({ fieldPaths: { name: 'user.profile.name' } }, 'customForm');

      const result = service.createEvaluationContext(fieldContext, undefined, 'customForm');

      expect(result.fieldPath).toBe('user.profile.name');
    });
  });

  describe('registerFieldPath', () => {
    it('should register field path with default form id', () => {
      service.registerFieldPath('email', 'user');

      const context = mockRootFormRegistry.getFormContext();

      expect(context.fieldPaths).toEqual({ email: 'user.email' });
    });

    it('should register field path with parent path', () => {
      service.registerFieldPath('street', 'user.address');

      const context = mockRootFormRegistry.getFormContext();

      expect(context.fieldPaths).toEqual({ street: 'user.address.street' });
    });

    it('should register field path without parent path', () => {
      service.registerFieldPath('name', '');

      const context = mockRootFormRegistry.getFormContext();

      expect(context.fieldPaths).toEqual({ name: 'name' });
    });

    it('should register numeric field key', () => {
      service.registerFieldPath(0, 'items');

      const context = mockRootFormRegistry.getFormContext();

      expect(context.fieldPaths).toEqual({ '0': 'items.0' });
    });

    it('should register multiple field paths', () => {
      service.registerFieldPath('email', 'user');
      service.registerFieldPath('name', 'user');
      service.registerFieldPath('age', 'user');

      const context = mockRootFormRegistry.getFormContext();

      expect(context.fieldPaths).toEqual({
        email: 'user.email',
        name: 'user.name',
        age: 'user.age',
      });
    });

    it('should update existing field path', () => {
      service.registerFieldPath('email', 'user');
      service.registerFieldPath('email', 'admin');

      const context = mockRootFormRegistry.getFormContext();

      expect(context.fieldPaths).toEqual({ email: 'admin.email' });
    });

    it('should use custom form id', () => {
      service.registerFieldPath('name', 'user', 'customForm');

      const context = mockRootFormRegistry.getFormContext('customForm');

      expect(context.fieldPaths).toEqual({ name: 'user.name' });
    });

    it('should preserve existing context data', () => {
      mockRootFormRegistry.registerFormContext({ metadata: 'test' });

      service.registerFieldPath('email', 'user');

      const context = mockRootFormRegistry.getFormContext();

      expect(context.metadata).toBe('test');
      expect(context.fieldPaths).toEqual({ email: 'user.email' });
    });
  });

  describe('createFallbackContext', () => {
    it('should create context with field value only', () => {
      const fieldContext = createMockFieldContext('test value');

      const result = service.createFallbackContext(fieldContext);

      expect(result.fieldValue).toBe('test value');
      expect(result.formValue).toEqual({});
      expect(result.fieldPath).toBe('');
      expect(result.customFunctions).toEqual({});
    });

    it('should use field value as form value when it is an object', () => {
      const value = { name: 'John', age: 30 };
      const fieldContext = createMockFieldContext(value);

      const result = service.createFallbackContext(fieldContext);

      expect(result.fieldValue).toEqual(value);
      expect(result.formValue).toEqual(value);
    });

    it('should not use field value as form value for arrays', () => {
      const value = [1, 2, 3];
      const fieldContext = createMockFieldContext(value);

      const result = service.createFallbackContext(fieldContext);

      expect(result.fieldValue).toEqual(value);
      expect(result.formValue).toEqual({});
    });

    it('should not use field value as form value for primitives', () => {
      const fieldContext = createMockFieldContext('string value');

      const result = service.createFallbackContext(fieldContext);

      expect(result.fieldValue).toBe('string value');
      expect(result.formValue).toEqual({});
    });

    it('should include custom functions', () => {
      const customFunctions = {
        test: (ctx: any) => ctx.fieldValue,
      };

      const fieldContext = createMockFieldContext('test');
      const result = service.createFallbackContext(fieldContext, customFunctions);

      expect(result.customFunctions).toEqual(customFunctions);
    });

    it('should use empty object for custom functions when not provided', () => {
      const fieldContext = createMockFieldContext('test');
      const result = service.createFallbackContext(fieldContext);

      expect(result.customFunctions).toEqual({});
    });

    it('should always return empty field path', () => {
      const fieldContext = createMockFieldContext('test');
      const result = service.createFallbackContext(fieldContext);

      expect(result.fieldPath).toBe('');
    });

    it('should handle null field value', () => {
      const fieldContext = createMockFieldContext(null);
      const result = service.createFallbackContext(fieldContext);

      expect(result.fieldValue).toBe(null);
      expect(result.formValue).toEqual({});
    });

    it('should handle undefined field value', () => {
      const fieldContext = createMockFieldContext(undefined);
      const result = service.createFallbackContext(fieldContext);

      expect(result.fieldValue).toBe(undefined);
      expect(result.formValue).toEqual({});
    });
  });

  describe('integration scenarios', () => {
    it('should create complete evaluation context with all features', () => {
      const formValue = { user: { name: 'Alice', email: 'alice@example.com' } };
      const mockRootForm = vi.fn(() => ({
        value: vi.fn(() => formValue),
      }));

      mockRootFormRegistry.registerRootForm(mockRootForm as any);
      mockRootFormRegistry.registerFormContext({ fieldPaths: { email: 'user.email' } });

      const fieldContext: any = createMockFieldContext('alice@example.com');
      fieldContext.key = vi.fn(() => 'email');

      const customFunctions = {
        validateEmail: (ctx: any) => ctx.fieldValue.includes('@'),
      };

      const result = service.createEvaluationContext(fieldContext, customFunctions);

      expect(result.fieldValue).toBe('alice@example.com');
      expect(result.formValue).toEqual(formValue);
      expect(result.fieldPath).toBe('user.email');
      expect(result.customFunctions).toEqual(customFunctions);
    });

    it('should handle multiple forms with different ids', () => {
      const form1Value = { form1: 'data1' };
      const form2Value = { form2: 'data2' };

      const mockForm1 = vi.fn(() => ({ value: vi.fn(() => form1Value) }));
      const mockForm2 = vi.fn(() => ({ value: vi.fn(() => form2Value) }));

      mockRootFormRegistry.registerRootForm(mockForm1 as any, 'form1');
      mockRootFormRegistry.registerRootForm(mockForm2 as any, 'form2');

      const fieldContext = createMockFieldContext('test');

      const result1 = service.createEvaluationContext(fieldContext, undefined, 'form1');
      const result2 = service.createEvaluationContext(fieldContext, undefined, 'form2');

      expect(result1.formValue).toEqual(form1Value);
      expect(result2.formValue).toEqual(form2Value);
    });

    it('should handle nested field paths correctly', () => {
      service.registerFieldPath('city', 'user.address');
      service.registerFieldPath('street', 'user.address');

      const context = mockRootFormRegistry.getFormContext();

      expect(context.fieldPaths).toEqual({
        city: 'user.address.city',
        street: 'user.address.street',
      });
    });
  });
});
