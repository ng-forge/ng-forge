import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldContext, FieldTree } from '@angular/forms/signals';
import { createDynamicValueFunction } from './dynamic-value-factory';
import { FieldContextRegistryService, RootFormRegistryService } from '../registry';

describe('dynamic-value-factory (integration)', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService, FieldContextRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
  });

  function createMockFieldContext<T>(
    value: T,
    mockFormValue: Record<string, unknown> = { username: 'test', email: 'test@example.com' },
  ): FieldContext<T> {
    const formValueSignal = signal(mockFormValue);
    const mockRootField = Object.assign(
      () => ({
        value: formValueSignal,
        valid: signal(true),
        errors: signal(null),
        touched: signal(false),
        dirty: signal(false),
      }),
      { formValue: formValueSignal },
    ) as FieldTree<unknown>;

    return {
      value: signal(value),
      field: mockRootField,
      valueOf: () => mockFormValue,
      stateOf: () => ({}) as any,
    } as any;
  }

  it('should evaluate expressions with access to field value', () => {
    const result = runInInjectionContext(injector, () => {
      const dynamicFn = createDynamicValueFunction<string, boolean>('fieldValue === "hello"');
      const fieldContext = createMockFieldContext('hello');
      return dynamicFn(fieldContext);
    });

    expect(result).toBe(true);
  });

  it('should evaluate expressions with access to form values', () => {
    const result = runInInjectionContext(injector, () => {
      // Register a mock root form
      const mockFormValue = signal({ username: 'test', email: 'test@example.com' });
      const mockRootField = Object.assign(
        () => ({
          value: mockFormValue,
          valid: signal(true),
          errors: signal(null),
          touched: signal(false),
          dirty: signal(false),
        }),
        { formValue: mockFormValue },
      ) as FieldTree<unknown>;
      rootFormRegistry.registerRootForm(mockRootField);

      const dynamicFn = createDynamicValueFunction<string, boolean>('formValue.username === "test"');
      const fieldContext = createMockFieldContext('current-field-value');
      return dynamicFn(fieldContext);
    });

    expect(result).toBe(true);
  });

  it('should evaluate expressions with complex logic', () => {
    const result = runInInjectionContext(injector, () => {
      const mockFormValue = signal({ username: 'test', email: 'test@example.com' });
      const mockRootField = Object.assign(
        () => ({
          value: mockFormValue,
          valid: signal(true),
          errors: signal(null),
          touched: signal(false),
          dirty: signal(false),
        }),
        { formValue: mockFormValue },
      ) as FieldTree<unknown>;
      rootFormRegistry.registerRootForm(mockRootField);

      const dynamicFn = createDynamicValueFunction<string, number>('fieldValue.length + formValue.username.length');
      const fieldContext = createMockFieldContext('hello');
      return dynamicFn(fieldContext);
    });

    expect(result).toBe(9); // 'hello'.length (5) + 'test'.length (4)
  });

  it('should handle errors gracefully', () => {
    const result = runInInjectionContext(injector, () => {
      const dynamicFn = createDynamicValueFunction<string, any>('nonExistentProperty.method()');
      const fieldContext = createMockFieldContext('test');
      return dynamicFn(fieldContext);
    });

    expect(result).toBeUndefined();
  });

  it('should return different types based on expression', () => {
    runInInjectionContext(injector, () => {
      const testCases = [
        { expression: '"string result"', expected: 'string result' },
        { expression: '42', expected: 42 },
        { expression: 'true', expected: true },
        { expression: '[1, 2, 3]', expected: [1, 2, 3] },
      ];

      testCases.forEach(({ expression, expected }) => {
        const dynamicFn = createDynamicValueFunction(expression);
        const fieldContext = createMockFieldContext('test');
        const result = dynamicFn(fieldContext);
        expect(result).toEqual(expected);
      });
    });
  });
});
