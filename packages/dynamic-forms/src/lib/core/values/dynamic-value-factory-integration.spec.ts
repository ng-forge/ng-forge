import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type FieldContext, form, schema } from '@angular/forms/signals';
import { createDynamicValueFunction } from './dynamic-value-factory';
import { FieldContextRegistryService, RootFormRegistryService } from '../registry';
import { FormStateManager } from '../../state/form-state-manager';

describe('dynamic-value-factory (integration)', () => {
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        FieldContextRegistryService,
      ],
    });

    injector = TestBed.inject(Injector);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  function createFieldContext<T>(fieldValue: T, fieldAccessor: () => unknown): FieldContext<T> {
    // Test helper - creates minimal FieldContext for dynamic value evaluation
    return {
      value: signal(fieldValue),
      field: fieldAccessor(),
      valueOf: () => ({}),
      stateOf: fieldAccessor,
    } as unknown as FieldContext<T>;
  }

  it('should evaluate expressions with access to field value', () => {
    const result = runInInjectionContext(injector, () => {
      const formValue = signal({ testField: 'hello' });
      const formInstance = form(
        formValue,
        schema<{ testField: string }>(() => void 0),
      );
      mockFormSignal.set(formInstance);

      const dynamicFn = createDynamicValueFunction<string, boolean>('fieldValue === "hello"');
      const fieldContext = createFieldContext('hello', () => formInstance.testField());
      return dynamicFn(fieldContext);
    });

    expect(result).toBe(true);
  });

  it('should evaluate expressions with access to form values', () => {
    const result = runInInjectionContext(injector, () => {
      const formValue = signal({ username: 'test', email: 'test@example.com' });
      mockEntity.set({ username: 'test', email: 'test@example.com' });

      const formInstance = form(
        formValue,
        schema<{ username: string; email: string }>(() => void 0),
      );
      mockFormSignal.set(formInstance);

      const dynamicFn = createDynamicValueFunction<string, boolean>('formValue.username === "test"');
      const fieldContext = createFieldContext('current-field-value', () => formInstance.username());
      return dynamicFn(fieldContext);
    });

    expect(result).toBe(true);
  });

  it('should evaluate expressions with complex logic', () => {
    const result = runInInjectionContext(injector, () => {
      const formValue = signal({ username: 'test', email: 'test@example.com' });
      mockEntity.set({ username: 'test', email: 'test@example.com' });

      const formInstance = form(
        formValue,
        schema<{ username: string; email: string }>(() => void 0),
      );
      mockFormSignal.set(formInstance);

      const dynamicFn = createDynamicValueFunction<string, number>('fieldValue.length + formValue.username.length');
      const fieldContext = createFieldContext('hello', () => formInstance.username());
      return dynamicFn(fieldContext);
    });

    expect(result).toBe(9); // 'hello'.length (5) + 'test'.length (4)
  });

  it('should handle errors gracefully', () => {
    const result = runInInjectionContext(injector, () => {
      const formValue = signal({ testField: 'test' });
      const formInstance = form(
        formValue,
        schema<{ testField: string }>(() => void 0),
      );
      mockFormSignal.set(formInstance);

      const dynamicFn = createDynamicValueFunction<string, unknown>('nonExistentProperty.method()');
      const fieldContext = createFieldContext('test', () => formInstance.testField());
      return dynamicFn(fieldContext);
    });

    expect(result).toBeUndefined();
  });

  it('should return different types based on expression', () => {
    runInInjectionContext(injector, () => {
      const formValue = signal({ testField: 'test' });
      const formInstance = form(
        formValue,
        schema<{ testField: string }>(() => void 0),
      );
      mockFormSignal.set(formInstance);

      const testCases = [
        { expression: '"string result"', expected: 'string result' },
        { expression: '42', expected: 42 },
        { expression: 'true', expected: true },
        { expression: '[1, 2, 3]', expected: [1, 2, 3] },
      ];

      testCases.forEach(({ expression, expected }) => {
        const dynamicFn = createDynamicValueFunction(expression);
        const fieldContext = createFieldContext('test', () => formInstance.testField());
        const result = dynamicFn(fieldContext);
        expect(result).toEqual(expected);
      });
    });
  });
});
