import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { checkboxFieldMapper } from './checkbox-field-mapper';
import { BaseCheckedField } from '../../definitions';
import { FieldSignalContext } from '../types';
import { FIELD_SIGNAL_CONTEXT } from '@ng-forge/dynamic-forms';

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

  function testMapper(fieldDef: BaseCheckedField<unknown>, injector: EnvironmentInjector): Record<string, unknown> {
    const inputsSignal = runInInjectionContext(injector, () => checkboxFieldMapper(fieldDef));
    return inputsSignal();
  }

  describe('base properties (from buildBaseInputs)', () => {
    it('should include key from base mapper', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['key']).toBe('agreeTerms');
    });

    it('should include label when defined', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
        label: 'I agree to the terms',
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['label']).toBe('I agree to the terms');
    });

    it('should include className when defined', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
        className: 'terms-checkbox',
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['className']).toContain('terms-checkbox');
    });

    it('should include tabIndex when defined', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
        tabIndex: 3,
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['tabIndex']).toBe(3);
    });

    it('should include props when defined', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
        props: { color: 'primary', indeterminate: false },
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['props']).toEqual({ color: 'primary', indeterminate: false });
    });
  });

  describe('checkbox-specific properties', () => {
    it('should include placeholder when defined', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
        placeholder: 'Check to agree',
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['placeholder']).toBe('Check to agree');
    });
  });

  describe('validation messages', () => {
    it('should always include validationMessages (empty object if not provided)', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['validationMessages']).toEqual({});
    });

    it('should include custom validationMessages when provided', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
        validationMessages: {
          required: 'You must agree to the terms',
        },
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['validationMessages']).toEqual({
        required: 'You must agree to the terms',
      });
    });

    it('should include defaultValidationMessages from context', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
      };

      const injector = createTestInjector({
        fieldKey: 'agreeTerms',
        defaultValidationMessages: { required: 'This checkbox is required' },
      });

      const inputs = testMapper(fieldDef, injector);

      expect(inputs['defaultValidationMessages']).toEqual({ required: 'This checkbox is required' });
    });
  });

  describe('field proxy binding', () => {
    it('should include field proxy when form field exists', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs).toHaveProperty('field');
    });
  });

  describe('excluded properties (NOT passed to component)', () => {
    it('should NOT include type in inputs', () => {
      const fieldDef: BaseCheckedField<unknown> = {
        key: 'agreeTerms',
        type: 'checkbox',
        label: 'Agree',
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs).not.toHaveProperty('type');
    });

    it('should NOT include disabled in inputs (handled by logic)', () => {
      const fieldDef = {
        key: 'agreeTerms',
        type: 'checkbox' as const,
        disabled: true,
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef as BaseCheckedField<unknown>, injector);

      expect(inputs).not.toHaveProperty('disabled');
    });

    it('should NOT include readonly in inputs (handled by logic)', () => {
      const fieldDef = {
        key: 'agreeTerms',
        type: 'checkbox' as const,
        readonly: true,
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef as BaseCheckedField<unknown>, injector);

      expect(inputs).not.toHaveProperty('readonly');
    });

    it('should NOT include hidden in inputs (handled by logic)', () => {
      const fieldDef = {
        key: 'agreeTerms',
        type: 'checkbox' as const,
        hidden: true,
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef as BaseCheckedField<unknown>, injector);

      expect(inputs).not.toHaveProperty('hidden');
    });

    it('should NOT include validation config in inputs', () => {
      const fieldDef = {
        key: 'agreeTerms',
        type: 'checkbox' as const,
        validation: { required: true },
        required: true,
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef as BaseCheckedField<unknown>, injector);

      expect(inputs).not.toHaveProperty('validation');
      expect(inputs).not.toHaveProperty('required');
    });

    it('should NOT include conditionals in inputs', () => {
      const fieldDef = {
        key: 'agreeTerms',
        type: 'checkbox' as const,
        conditionals: { show: { field: 'other', equals: 'yes' } },
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef as BaseCheckedField<unknown>, injector);

      expect(inputs).not.toHaveProperty('conditionals');
    });

    it('should NOT include value in inputs (handled by form)', () => {
      const fieldDef = {
        key: 'agreeTerms',
        type: 'checkbox' as const,
        value: true,
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef as BaseCheckedField<unknown>, injector);

      expect(inputs).not.toHaveProperty('value');
    });

    it('should NOT pass through unknown custom properties', () => {
      const fieldDef = {
        key: 'agreeTerms',
        type: 'checkbox' as const,
        customUnknownProp: 'should not pass',
        anotherCustomProp: 123,
      };

      const injector = createTestInjector({ fieldKey: 'agreeTerms' });
      const inputs = testMapper(fieldDef as BaseCheckedField<unknown>, injector);

      expect(inputs).not.toHaveProperty('customUnknownProp');
      expect(inputs).not.toHaveProperty('anotherCustomProp');
    });
  });

  describe('complete field integration', () => {
    it('should correctly map a complete checkbox field definition', () => {
      const checkboxField: BaseCheckedField<unknown> = {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        placeholder: 'Check to subscribe',
        className: 'newsletter-checkbox',
        tabIndex: 2,
        props: { color: 'accent' },
        validationMessages: { required: 'Please confirm your choice' },
      };

      const injector = createTestInjector({ fieldKey: 'newsletter' });
      const inputs = testMapper(checkboxField, injector);

      // Verify included properties
      expect(inputs['key']).toBe('newsletter');
      expect(inputs['label']).toBe('Subscribe to newsletter');
      expect(inputs['placeholder']).toBe('Check to subscribe');
      expect(inputs['className']).toContain('newsletter-checkbox');
      expect(inputs['tabIndex']).toBe(2);
      expect(inputs['props']).toEqual({ color: 'accent' });
      expect(inputs['validationMessages']).toEqual({ required: 'Please confirm your choice' });
      expect(inputs).toHaveProperty('field');

      // Verify type is excluded
      expect(inputs).not.toHaveProperty('type');
    });

    it('should correctly map a toggle field definition', () => {
      const toggleField: BaseCheckedField<unknown> = {
        key: 'darkMode',
        type: 'toggle',
        label: 'Enable Dark Mode',
        props: { labelPosition: 'before' },
      };

      const injector = createTestInjector({ fieldKey: 'darkMode' });
      const inputs = testMapper(toggleField, injector);

      expect(inputs['key']).toBe('darkMode');
      expect(inputs['label']).toBe('Enable Dark Mode');
      expect(inputs['props']).toEqual({ labelPosition: 'before' });
      expect(inputs).not.toHaveProperty('type');
    });
  });
});
