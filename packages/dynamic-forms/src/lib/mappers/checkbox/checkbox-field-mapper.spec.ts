import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { checkboxFieldMapper } from './checkbox-field-mapper';
import { BaseCheckedField } from '../../definitions';
import { FieldSignalContext } from '../types';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';

describe('checkboxFieldMapper', () => {
  let parentInjector: EnvironmentInjector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    parentInjector = TestBed.inject(EnvironmentInjector);
  });

  function createTestInjector(options?: { defaultValidationMessages?: Record<string, string>; fieldKey?: string }): EnvironmentInjector {
    const fieldKey = options?.fieldKey || 'testField';
    const initialValue = signal({ [fieldKey]: false });

    const testForm = runInInjectionContext(parentInjector, () => {
      return form(initialValue);
    });

    const mockContext: FieldSignalContext = {
      injector: parentInjector,
      value: initialValue,
      defaultValues: () => ({ [fieldKey]: false }),
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

  function testMapper(fieldDef: BaseCheckedField<any>, injector: EnvironmentInjector): Record<string, unknown> {
    const inputsSignal = runInInjectionContext(injector, () => checkboxFieldMapper(fieldDef));
    return inputsSignal(); // Call the signal to get the actual inputs
  }

  it('should create inputs object with field properties plus validationMessages', () => {
    const testCases = [
      {
        desc: 'minimal field',
        field: { key: 'minimal', type: 'checkbox' as const, label: 'Minimal' },
        minKeys: 3, // key + label + validationMessages
      },
      {
        desc: 'field with standard properties',
        field: {
          key: 'standard',
          type: 'checkbox' as const,
          label: 'Standard',
          className: 'class',
          tabIndex: 1,
          props: { hint: 'hint' },
        },
        minKeys: 6, // key + label + className + tabIndex + props + validationMessages
      },
      {
        desc: 'field with custom validationMessages',
        field: {
          key: 'custom',
          type: 'checkbox' as const,
          label: 'Custom',
          validationMessages: { required: 'Required' },
        },
        minKeys: 3, // key + label + validationMessages
      },
    ];

    testCases.forEach(({ desc, field, minKeys }) => {
      const injector = createTestInjector({ fieldKey: field.key });
      const inputs = testMapper(field, injector);
      expect(Object.keys(inputs).length).toBeGreaterThanOrEqual(minKeys);
    });
  });

  it('should always include validationMessages in inputs', () => {
    const fieldWithoutMessages: BaseCheckedField<any> = {
      key: 'noMessages',
      type: 'checkbox',
      label: 'No Messages',
    };

    const fieldWithMessages: BaseCheckedField<any> = {
      key: 'withMessages',
      type: 'checkbox',
      label: 'With Messages',
      validationMessages: { required: 'Required' },
    };

    const injector1 = createTestInjector({ fieldKey: 'noMessages' });
    const injector2 = createTestInjector({ fieldKey: 'withMessages' });

    const inputs1 = testMapper(fieldWithoutMessages, injector1);
    const inputs2 = testMapper(fieldWithMessages, injector2);

    expect(Object.keys(inputs1).length).toBeGreaterThanOrEqual(3); // includes validationMessages even when undefined
    expect(Object.keys(inputs2).length).toBeGreaterThanOrEqual(3);
    expect(inputs1).toHaveProperty('validationMessages');
    expect(inputs2).toHaveProperty('validationMessages');
  });

  it('should include defaultValidationMessages from context', () => {
    const fieldDef: BaseCheckedField<any> = {
      key: 'contextMessages',
      type: 'checkbox',
      label: 'Context Messages',
    };

    const injector = createTestInjector({
      fieldKey: 'contextMessages',
      defaultValidationMessages: { required: 'Default required' },
    });

    const inputs = testMapper(fieldDef, injector);
    expect(Object.keys(inputs).length).toBeGreaterThanOrEqual(4); // includes defaultValidationMessages
    expect(inputs).toHaveProperty('defaultValidationMessages');
  });

  it('should handle edge cases (empty key, excluded properties)', () => {
    const testCases = [
      {
        field: { key: '', type: 'checkbox' as const, label: 'Empty Key' },
        expectedMin: 3,
      },
      {
        field: {
          key: 'excluded',
          type: 'checkbox' as const,
          label: 'Excluded Props',
          disabled: true,
          readonly: false,
          validation: { required: true },
        } as any,
        expectedMin: 3, // excluded props not counted
      },
    ];

    testCases.forEach(({ field, expectedMin }) => {
      const injector = createTestInjector({ fieldKey: field.key || 'test' });
      const inputs = testMapper(field, injector);
      expect(Object.keys(inputs).length).toBeGreaterThanOrEqual(expectedMin);
    });
  });
});
