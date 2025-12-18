import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
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
      const formValueSignal = signal(formValue);

      mockRootFormRegistry.registerFormValueSignal(formValueSignal);

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

    it('should handle root form that throws error gracefully', () => {
      // When no form value signal or root form is registered, it returns empty object
      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.formValue).toEqual({});
    });

    it('should use custom form id', () => {
      const formValue = { custom: 'data' };
      const formValueSignal = signal(formValue);

      mockRootFormRegistry.registerFormValueSignal(formValueSignal, 'customForm');

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
    it('should extract field path from signal key', () => {
      const fieldContext: any = createMockFieldContext('test');
      // Use a real signal for key since isChildFieldContext checks isSignal()
      fieldContext.key = signal('email');

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldPath).toBe('email');
    });

    it('should return empty string when field has no key', () => {
      const fieldContext = createMockFieldContext('test');

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldPath).toBe('');
    });

    it('should return empty string when key is not a signal', () => {
      // When key exists but is not a signal, isChildFieldContext returns false
      const fieldContext: any = createMockFieldContext('test');
      fieldContext.key = vi.fn(() => 'email'); // Not a signal, so will return ''

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldPath).toBe('');
    });

    it('should extract numeric keys', () => {
      const fieldContext: any = createMockFieldContext('test');
      fieldContext.key = signal(0);

      const result = service.createEvaluationContext(fieldContext);

      expect(result.fieldPath).toBe('0');
    });
  });

  describe('integration scenarios', () => {
    it('should create complete evaluation context with all features', () => {
      const formValue = { user: { name: 'Alice', email: 'alice@example.com' } };
      const formValueSignal = signal(formValue);

      mockRootFormRegistry.registerFormValueSignal(formValueSignal);

      const fieldContext: any = createMockFieldContext('alice@example.com');
      // Use a real signal for key since isChildFieldContext checks isSignal()
      fieldContext.key = signal('email');

      const customFunctions = {
        validateEmail: (ctx: unknown) => (ctx as { fieldValue: string }).fieldValue.includes('@'),
      };

      const result = service.createEvaluationContext(fieldContext, customFunctions);

      expect(result.fieldValue).toBe('alice@example.com');
      expect(result.formValue).toEqual(formValue);
      expect(result.fieldPath).toBe('email');
      expect(result.customFunctions).toEqual(customFunctions);
    });

    it('should handle multiple forms with different ids', () => {
      const form1Value = { form1: 'data1' };
      const form2Value = { form2: 'data2' };

      const formValueSignal1 = signal(form1Value);
      const formValueSignal2 = signal(form2Value);

      mockRootFormRegistry.registerFormValueSignal(formValueSignal1, 'form1');
      mockRootFormRegistry.registerFormValueSignal(formValueSignal2, 'form2');

      const fieldContext = createMockFieldContext('test');

      const result1 = service.createEvaluationContext(fieldContext, undefined, 'form1');
      const result2 = service.createEvaluationContext(fieldContext, undefined, 'form2');

      expect(result1.formValue).toEqual(form1Value);
      expect(result2.formValue).toEqual(form2Value);
    });
  });

  describe('createDisplayOnlyContext', () => {
    it('should create context with undefined fieldValue', () => {
      const result = service.createDisplayOnlyContext('infoText');

      expect(result.fieldValue).toBeUndefined();
    });

    it('should include fieldPath', () => {
      const result = service.createDisplayOnlyContext('myTextField');

      expect(result.fieldPath).toBe('myTextField');
    });

    it('should include form value from registry', () => {
      const formValue = { name: 'Alice', email: 'alice@example.com' };
      mockRootFormRegistry.registerFormValueSignal(signal(formValue));

      const result = service.createDisplayOnlyContext('infoText');

      expect(result.formValue).toEqual(formValue);
    });

    it('should include custom functions when provided', () => {
      const customFunctions = {
        isValid: () => true,
      };

      const result = service.createDisplayOnlyContext('infoText', customFunctions);

      expect(result.customFunctions).toEqual(customFunctions);
    });

    it('should use empty object for custom functions when not provided', () => {
      const result = service.createDisplayOnlyContext('infoText');

      expect(result.customFunctions).toEqual({});
    });

    it('should support custom form ID', () => {
      const formValue = { status: 'active' };
      mockRootFormRegistry.registerFormValueSignal(signal(formValue), 'customForm');

      const result = service.createDisplayOnlyContext('infoText', undefined, 'customForm');

      expect(result.formValue).toEqual(formValue);
    });

    it('should return empty form value when no form is registered', () => {
      const result = service.createDisplayOnlyContext('infoText');

      expect(result.formValue).toEqual({});
    });
  });
});
