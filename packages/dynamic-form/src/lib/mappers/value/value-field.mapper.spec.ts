import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { valueFieldMapper } from './value-field.mapper';
import { BaseValueField } from '../../definitions';
import { FieldSignalContext } from '../types';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';

describe('valueFieldMapper', () => {
  let parentInjector: EnvironmentInjector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    parentInjector = TestBed.inject(EnvironmentInjector);
  });

  function createTestInjector(options?: { defaultValidationMessages?: Record<string, string>; fieldKey?: string }): EnvironmentInjector {
    const fieldKey = options?.fieldKey || 'testField';
    const initialValue = signal({ [fieldKey]: 'test value' });

    const testForm = runInInjectionContext(parentInjector, () => {
      return form(initialValue);
    });

    const mockContext: FieldSignalContext = {
      injector: parentInjector,
      value: initialValue,
      defaultValues: () => ({ [fieldKey]: '' }),
      form: testForm,
      defaultValidationMessages: options?.defaultValidationMessages,
    };

    return createEnvironmentInjector(
      [
        {
          provide: FIELD_SIGNAL_CONTEXT,
          useValue: mockContext,
        },
      ],
      parentInjector,
    );
  }

  function testMapper(fieldDef: BaseValueField<any, any>, injector: EnvironmentInjector) {
    return runInInjectionContext(injector, () => valueFieldMapper(fieldDef));
  }

  it('should create bindings for field properties plus validationMessages', () => {
    const testCases = [
      {
        desc: 'minimal field',
        field: { key: 'minimal', type: 'input' as const, label: 'Minimal' },
        minBindings: 3, // key + label + validationMessages
      },
      {
        desc: 'field with standard properties',
        field: {
          key: 'standard',
          type: 'input' as const,
          label: 'Standard',
          className: 'class',
          tabIndex: 1,
          props: { hint: 'hint' },
        },
        minBindings: 6, // key + label + className + tabIndex + props + validationMessages
      },
      {
        desc: 'field with custom validationMessages',
        field: {
          key: 'custom',
          type: 'input' as const,
          label: 'Custom',
          validationMessages: { required: 'Required', minLength: 'Too short' },
        },
        minBindings: 3,
      },
    ];

    testCases.forEach(({ desc, field, minBindings }) => {
      const injector = createTestInjector({ fieldKey: field.key });
      const bindings = testMapper(field, injector);
      expect(bindings.length).toBeGreaterThanOrEqual(minBindings);
    });
  });

  it('should always include validationMessages binding', () => {
    const fieldWithoutMessages: BaseValueField<any, any> = {
      key: 'noMessages',
      type: 'input',
      label: 'No Messages',
    };

    const fieldWithMessages: BaseValueField<any, any> = {
      key: 'withMessages',
      type: 'input',
      label: 'With Messages',
      validationMessages: { required: 'Required' },
    };

    const injector1 = createTestInjector({ fieldKey: 'noMessages' });
    const injector2 = createTestInjector({ fieldKey: 'withMessages' });

    const bindings1 = testMapper(fieldWithoutMessages, injector1);
    const bindings2 = testMapper(fieldWithMessages, injector2);

    expect(bindings1.length).toBeGreaterThanOrEqual(3);
    expect(bindings2.length).toBeGreaterThanOrEqual(3);
  });

  it('should include defaultValidationMessages from context', () => {
    const fieldDef: BaseValueField<any, any> = {
      key: 'contextMessages',
      type: 'input',
      label: 'Context Messages',
    };

    const injector = createTestInjector({
      fieldKey: 'contextMessages',
      defaultValidationMessages: { required: 'Default required' },
    });

    const bindings = testMapper(fieldDef, injector);
    expect(bindings.length).toBeGreaterThanOrEqual(4); // includes defaultValidationMessages
  });

  it('should handle edge cases (empty key, excluded properties)', () => {
    const testCases = [
      {
        field: { key: '', type: 'input' as const, label: 'Empty Key' },
        expectedMin: 3,
      },
      {
        field: {
          key: 'excluded',
          type: 'input' as const,
          label: 'Excluded Props',
          disabled: true,
          readonly: false,
          validation: { required: true },
        } as any,
        expectedMin: 3, // excluded props not counted
      },
      {
        field: {
          key: 'complex',
          type: 'input' as const,
          label: 'Complex',
          className: 'class',
          tabIndex: 5,
          props: { placeholder: 'Enter text', hint: 'Hint text' },
          validationMessages: { required: 'Required', pattern: 'Invalid format' },
        },
        expectedMin: 6,
      },
    ];

    testCases.forEach(({ field, expectedMin }) => {
      const injector = createTestInjector({ fieldKey: field.key || 'test' });
      const bindings = testMapper(field, injector);
      expect(bindings.length).toBeGreaterThanOrEqual(expectedMin);
    });
  });
});
