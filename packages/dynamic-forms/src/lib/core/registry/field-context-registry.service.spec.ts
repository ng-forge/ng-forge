import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Signal, signal } from '@angular/core';
import { FieldContextRegistryService } from './field-context-registry.service';
import { RootFormRegistryService } from './root-form-registry.service';
import { EXTERNAL_DATA } from '../../models/field-signal-context.token';
import { FieldContext } from '@angular/forms/signals';

describe('FieldContextRegistryService', () => {
  let service: FieldContextRegistryService;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<unknown>(undefined);
  const externalDataSignal = signal<Record<string, Signal<unknown>> | undefined>(undefined);

  function createMockFieldContext<T>(value: T, pathKeys: readonly string[] = []): FieldContext<T> {
    return {
      value: signal(value),
      touched: signal(false),
      valid: signal(true),
      pathKeys: signal(pathKeys),
    } as unknown as FieldContext<T>;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: EXTERNAL_DATA, useValue: externalDataSignal },
      ],
    });

    service = TestBed.inject(FieldContextRegistryService);
    mockEntity.set({});
    mockFormSignal.set(undefined);
    externalDataSignal.set(undefined);
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
      mockEntity.set(formValue);

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.formValue).toEqual(formValue);
    });

    it('should handle root form with empty value', () => {
      mockEntity.set({});

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.formValue).toEqual({});
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
      mockEntity.set(formValue);

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
      mockEntity.set(formValue);

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

    it('should return empty form value when entity is empty', () => {
      const result = service.createDisplayOnlyContext('infoText');

      expect(result.formValue).toEqual({});
    });
  });

  describe('createReactiveEvaluationContext', () => {
    it('should create context with reactive field value', () => {
      const fieldContext = createMockFieldContext('reactive-value');

      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.fieldValue).toBe('reactive-value');
    });

    it('should include reactive form value', () => {
      const formValue = { name: 'Bob' };
      mockEntity.set(formValue);

      const fieldContext = createMockFieldContext('test');
      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.formValue).toEqual(formValue);
    });

    it('should extract field path from signal key', () => {
      const fieldContext: any = createMockFieldContext('test');
      fieldContext.key = signal('username');

      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.fieldPath).toBe('username');
    });

    it('should include custom functions', () => {
      const customFunctions = { isActive: () => true };
      const fieldContext = createMockFieldContext('test');

      const result = service.createReactiveEvaluationContext(fieldContext, customFunctions);

      expect(result.customFunctions).toEqual(customFunctions);
    });

    it('should default custom functions to empty object', () => {
      const fieldContext = createMockFieldContext('test');

      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.customFunctions).toEqual({});
    });
  });

  describe('external data resolution', () => {
    it('should return undefined externalData when token provides undefined', () => {
      externalDataSignal.set(undefined);

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.externalData).toBeUndefined();
    });

    it('should resolve external data signals in createEvaluationContext', () => {
      externalDataSignal.set({
        userId: signal('user-123'),
        role: signal('admin'),
      });

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.externalData).toEqual({ userId: 'user-123', role: 'admin' });
    });

    it('should resolve external data signals in createReactiveEvaluationContext', () => {
      externalDataSignal.set({
        theme: signal('dark'),
      });

      const fieldContext = createMockFieldContext('test');
      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.externalData).toEqual({ theme: 'dark' });
    });

    it('should resolve external data signals in createDisplayOnlyContext', () => {
      externalDataSignal.set({
        locale: signal('en-US'),
      });

      const result = service.createDisplayOnlyContext('infoText');

      expect(result.externalData).toEqual({ locale: 'en-US' });
    });

    it('should handle empty external data record', () => {
      externalDataSignal.set({});

      const fieldContext = createMockFieldContext('test');
      const result = service.createEvaluationContext(fieldContext);

      expect(result.externalData).toEqual({});
    });
  });

  describe('array-scoped context creation via pathKeys', () => {
    const arrayFormValue = {
      addresses: [
        { street: '123 Main St', city: 'Springfield', hasApartment: true },
        { street: '456 Oak Ave', city: 'Shelbyville', hasApartment: false },
      ],
      globalField: 'global',
    };

    it('createReactiveEvaluationContext should scope formValue to array item', () => {
      mockEntity.set(arrayFormValue);
      const fieldContext: any = createMockFieldContext('123 Main St', ['addresses', '0', 'street']);
      fieldContext.key = signal('street');

      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.formValue).toEqual({ street: '123 Main St', city: 'Springfield', hasApartment: true });
    });

    it('should set rootFormValue to the full root form value', () => {
      mockEntity.set(arrayFormValue);
      const fieldContext: any = createMockFieldContext('123 Main St', ['addresses', '0', 'street']);
      fieldContext.key = signal('street');

      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.rootFormValue).toEqual(arrayFormValue);
    });

    it('should set arrayIndex and arrayPath correctly', () => {
      mockEntity.set(arrayFormValue);
      const fieldContext: any = createMockFieldContext('456 Oak Ave', ['addresses', '1', 'street']);
      fieldContext.key = signal('street');

      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.arrayIndex).toBe(1);
      expect(result.arrayPath).toBe('addresses');
    });

    it('should build fieldPath as arrayKey.index.localKey', () => {
      mockEntity.set(arrayFormValue);
      const fieldContext: any = createMockFieldContext(true, ['addresses', '0', 'hasApartment']);
      fieldContext.key = signal('hasApartment');

      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.fieldPath).toBe('addresses.0.hasApartment');
    });

    it('different index should return different array item', () => {
      mockEntity.set(arrayFormValue);
      const fieldContext0: any = createMockFieldContext('123 Main St', ['addresses', '0', 'street']);
      fieldContext0.key = signal('street');
      const fieldContext1: any = createMockFieldContext('456 Oak Ave', ['addresses', '1', 'street']);
      fieldContext1.key = signal('street');

      const result0 = service.createReactiveEvaluationContext(fieldContext0);
      const result1 = service.createReactiveEvaluationContext(fieldContext1);

      expect(result0.formValue).toEqual({ street: '123 Main St', city: 'Springfield', hasApartment: true });
      expect(result1.formValue).toEqual({ street: '456 Oak Ave', city: 'Shelbyville', hasApartment: false });
    });

    it('createEvaluationContext should scope formValue to array item', () => {
      mockEntity.set(arrayFormValue);
      const fieldContext: any = createMockFieldContext('Springfield', ['addresses', '0', 'city']);
      fieldContext.key = signal('city');

      const result = service.createEvaluationContext(fieldContext);

      expect(result.formValue).toEqual({ street: '123 Main St', city: 'Springfield', hasApartment: true });
      expect(result.rootFormValue).toEqual(arrayFormValue);
      expect(result.fieldPath).toBe('addresses.0.city');
    });

    it('should fall back to root form when array data is missing', () => {
      const formWithoutArray = { globalField: 'global' };
      mockEntity.set(formWithoutArray);
      const fieldContext: any = createMockFieldContext('test', ['addresses', '0', 'street']);
      fieldContext.key = signal('street');

      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.formValue).toEqual(formWithoutArray);
      expect(result.rootFormValue).toBeUndefined();
      expect(result.arrayIndex).toBeUndefined();
    });

    it('should fall back to root form when index is out of bounds', () => {
      mockEntity.set(arrayFormValue);
      const fieldContext: any = createMockFieldContext('test', ['addresses', '99', 'street']);
      fieldContext.key = signal('street');

      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.formValue).toEqual(arrayFormValue);
      expect(result.rootFormValue).toBeUndefined();
    });

    it('should have unchanged behavior when pathKeys has no array segment', () => {
      mockEntity.set(arrayFormValue);
      const fieldContext: any = createMockFieldContext('test', ['street']);
      fieldContext.key = signal('street');

      const result = service.createReactiveEvaluationContext(fieldContext);

      expect(result.formValue).toEqual(arrayFormValue);
      expect(result.rootFormValue).toBeUndefined();
      expect(result.arrayIndex).toBeUndefined();
      expect(result.arrayPath).toBeUndefined();
    });
  });
});
