import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { valueFieldMapper } from './value-field.mapper';
import { BaseValueField } from '../../definitions';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { FieldSignalContext } from '../types';

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

  function testMapper<T>(fieldDef: BaseValueField<T, string>, injector: EnvironmentInjector): Record<string, unknown> {
    const inputsSignal = runInInjectionContext(injector, () => valueFieldMapper(fieldDef));
    return inputsSignal();
  }

  describe('base properties (from buildBaseInputs)', () => {
    it('should include key from base mapper', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['key']).toBe('testField');
    });

    it('should include label when defined', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['label']).toBe('Test Label');
    });

    it('should include className when defined', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
        className: 'custom-class',
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['className']).toContain('custom-class');
    });

    it('should include tabIndex when defined', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
        tabIndex: 5,
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['tabIndex']).toBe(5);
    });

    it('should include props when defined', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
        props: { hint: 'Helper text', autocomplete: 'off' },
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['props']).toEqual({ hint: 'Helper text', autocomplete: 'off' });
    });
  });

  describe('value field specific properties', () => {
    it('should include placeholder when defined', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
        placeholder: 'Enter value...',
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['placeholder']).toBe('Enter value...');
    });

    it('should include options for select fields', () => {
      const selectField = {
        key: 'selectField',
        type: 'select' as const,
        options: [
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'selectField' });
      const inputs = testMapper(selectField as BaseValueField<unknown, string>, injector);

      expect(inputs['options']).toEqual([
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
      ]);
    });

    it('should include minDate and maxDate for datepicker fields', () => {
      const datepickerField = {
        key: 'dateField',
        type: 'datepicker' as const,
        minDate: '2020-01-01',
        maxDate: '2025-12-31',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(datepickerField as BaseValueField<unknown, string>, injector);

      expect(inputs['minDate']).toBe('2020-01-01');
      expect(inputs['maxDate']).toBe('2025-12-31');
    });

    it('should include startAt for datepicker fields', () => {
      const datepickerField = {
        key: 'dateField',
        type: 'datepicker' as const,
        startAt: new Date('2023-06-15'),
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(datepickerField as BaseValueField<unknown, string>, injector);

      expect(inputs['startAt']).toEqual(new Date('2023-06-15'));
    });

    it('should NOT pass min, max, step as inputs (handled by Angular Signal Forms field state)', () => {
      const sliderField = {
        key: 'sliderField',
        type: 'slider' as const,
        minValue: 0,
        maxValue: 100,
        step: 5,
      };

      const injector = createTestInjector({ fieldKey: 'sliderField' });
      const inputs = testMapper(sliderField as BaseValueField<unknown, string>, injector);

      // min/max/step are accessed from field state (f().min?.(), f().max?.())
      // not passed as component inputs
      expect(inputs).not.toHaveProperty('min');
      expect(inputs).not.toHaveProperty('max');
      expect(inputs).not.toHaveProperty('step');
      expect(inputs).not.toHaveProperty('minValue');
      expect(inputs).not.toHaveProperty('maxValue');
    });

    it('should include rows and cols for textarea fields', () => {
      const textareaField = {
        key: 'textareaField',
        type: 'textarea' as const,
        rows: 10,
        cols: 50,
      };

      const injector = createTestInjector({ fieldKey: 'textareaField' });
      const inputs = testMapper(textareaField as BaseValueField<unknown, string>, injector);

      expect(inputs['rows']).toBe(10);
      expect(inputs['cols']).toBe(50);
    });
  });

  describe('validation messages', () => {
    it('should always include validationMessages (empty object if not provided)', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['validationMessages']).toEqual({});
    });

    it('should include custom validationMessages when provided', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
        validationMessages: {
          required: 'This field is required',
          minLength: 'Too short',
        },
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['validationMessages']).toEqual({
        required: 'This field is required',
        minLength: 'Too short',
      });
    });

    it('should include defaultValidationMessages from context', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
      };

      const injector = createTestInjector({
        fieldKey: 'testField',
        defaultValidationMessages: { required: 'Default required message' },
      });

      const inputs = testMapper(fieldDef, injector);

      expect(inputs['defaultValidationMessages']).toEqual({ required: 'Default required message' });
    });
  });

  describe('field proxy binding', () => {
    it('should include field proxy when form field exists', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef, injector);

      // Field proxy should be present (the actual value depends on form structure)
      expect(inputs).toHaveProperty('field');
    });
  });

  describe('excluded properties (NOT passed to component)', () => {
    it('should NOT include type in inputs', () => {
      const fieldDef: BaseValueField<unknown, string> = {
        key: 'testField',
        type: 'input',
        label: 'Test',
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs).not.toHaveProperty('type');
    });

    it('should NOT include disabled in inputs (handled by logic)', () => {
      const fieldDef = {
        key: 'testField',
        type: 'input' as const,
        disabled: true,
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef as BaseValueField<unknown, string>, injector);

      expect(inputs).not.toHaveProperty('disabled');
    });

    it('should NOT include readonly in inputs (handled by logic)', () => {
      const fieldDef = {
        key: 'testField',
        type: 'input' as const,
        readonly: true,
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef as BaseValueField<unknown, string>, injector);

      expect(inputs).not.toHaveProperty('readonly');
    });

    it('should NOT include hidden in inputs (handled by logic)', () => {
      const fieldDef = {
        key: 'testField',
        type: 'input' as const,
        hidden: true,
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef as BaseValueField<unknown, string>, injector);

      expect(inputs).not.toHaveProperty('hidden');
    });

    it('should NOT include validation config in inputs', () => {
      const fieldDef = {
        key: 'testField',
        type: 'input' as const,
        validation: { required: true, minLength: 5 },
        required: true,
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef as BaseValueField<unknown, string>, injector);

      expect(inputs).not.toHaveProperty('validation');
      expect(inputs).not.toHaveProperty('required');
    });

    it('should NOT include conditionals in inputs', () => {
      const fieldDef = {
        key: 'testField',
        type: 'input' as const,
        conditionals: { show: { field: 'other', equals: 'yes' } },
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef as BaseValueField<unknown, string>, injector);

      expect(inputs).not.toHaveProperty('conditionals');
    });

    it('should NOT include value in inputs (handled by form)', () => {
      const fieldDef = {
        key: 'testField',
        type: 'input' as const,
        value: 'initial value',
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef as BaseValueField<unknown, string>, injector);

      expect(inputs).not.toHaveProperty('value');
    });

    it('should NOT pass through unknown custom properties', () => {
      const fieldDef = {
        key: 'testField',
        type: 'input' as const,
        customUnknownProp: 'should not pass',
        anotherCustomProp: 123,
      };

      const injector = createTestInjector({ fieldKey: 'testField' });
      const inputs = testMapper(fieldDef as BaseValueField<unknown, string>, injector);

      expect(inputs).not.toHaveProperty('customUnknownProp');
      expect(inputs).not.toHaveProperty('anotherCustomProp');
    });
  });

  describe('complete field integration', () => {
    it('should correctly map a complete input field definition', () => {
      const inputField: BaseValueField<unknown, string> = {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        placeholder: 'Enter your email',
        className: 'email-field',
        tabIndex: 1,
        props: { autocomplete: 'email' },
        validationMessages: { required: 'Email is required', email: 'Invalid email format' },
      };

      const injector = createTestInjector({ fieldKey: 'email' });
      const inputs = testMapper(inputField, injector);

      // Verify included properties
      expect(inputs['key']).toBe('email');
      expect(inputs['label']).toBe('Email Address');
      expect(inputs['placeholder']).toBe('Enter your email');
      expect(inputs['className']).toContain('email-field');
      expect(inputs['tabIndex']).toBe(1);
      expect(inputs['props']).toEqual({ autocomplete: 'email' });
      expect(inputs['validationMessages']).toEqual({
        required: 'Email is required',
        email: 'Invalid email format',
      });
      expect(inputs).toHaveProperty('field');

      // Verify type is excluded
      expect(inputs).not.toHaveProperty('type');
    });

    it('should correctly map a complete select field definition', () => {
      const selectField = {
        key: 'country',
        type: 'select' as const,
        label: 'Country',
        placeholder: 'Select a country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'uk', label: 'United Kingdom' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'country' });
      const inputs = testMapper(selectField as BaseValueField<unknown, string>, injector);

      expect(inputs['key']).toBe('country');
      expect(inputs['label']).toBe('Country');
      expect(inputs['placeholder']).toBe('Select a country');
      expect(inputs['options']).toHaveLength(3);
      expect(inputs['options']).toEqual([
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'uk', label: 'United Kingdom' },
      ]);
    });

    it('should correctly map a complete datepicker field definition', () => {
      const datepickerField = {
        key: 'birthDate',
        type: 'datepicker' as const,
        label: 'Date of Birth',
        minDate: '1900-01-01',
        maxDate: '2010-12-31',
        startAt: new Date('2000-01-01'),
      };

      const injector = createTestInjector({ fieldKey: 'birthDate' });
      const inputs = testMapper(datepickerField as BaseValueField<unknown, string>, injector);

      expect(inputs['key']).toBe('birthDate');
      expect(inputs['label']).toBe('Date of Birth');
      expect(inputs['minDate']).toBe('1900-01-01');
      expect(inputs['maxDate']).toBe('2010-12-31');
      expect(inputs['startAt']).toEqual(new Date('2000-01-01'));
    });

    it('should correctly map a complete slider field definition (min/max via field state)', () => {
      const sliderField = {
        key: 'volume',
        type: 'slider' as const,
        label: 'Volume',
        minValue: 0,
        maxValue: 100,
      };

      const injector = createTestInjector({ fieldKey: 'volume' });
      const inputs = testMapper(sliderField as BaseValueField<unknown, string>, injector);

      expect(inputs['key']).toBe('volume');
      expect(inputs['label']).toBe('Volume');
      // min/max are accessed from field state, not component inputs
      expect(inputs).not.toHaveProperty('min');
      expect(inputs).not.toHaveProperty('max');
      expect(inputs).not.toHaveProperty('minValue');
      expect(inputs).not.toHaveProperty('maxValue');
    });

    it('should correctly map a complete textarea field definition', () => {
      const textareaField = {
        key: 'description',
        type: 'textarea' as const,
        label: 'Description',
        placeholder: 'Enter description...',
        rows: 5,
        cols: 40,
      };

      const injector = createTestInjector({ fieldKey: 'description' });
      const inputs = testMapper(textareaField as BaseValueField<unknown, string>, injector);

      expect(inputs['key']).toBe('description');
      expect(inputs['label']).toBe('Description');
      expect(inputs['placeholder']).toBe('Enter description...');
      expect(inputs['rows']).toBe(5);
      expect(inputs['cols']).toBe(40);
    });
  });
});
