import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { optionsFieldMapper, FieldWithOptions } from './options-field-mapper';
import { SelectField } from '../../definitions';
import { RadioField } from '../../definitions';
import { MultiCheckboxField } from '../../definitions';
import { FIELD_SIGNAL_CONTEXT } from '@ng-forge/dynamic-forms';
import { FieldSignalContext } from '../types';

describe('optionsFieldMapper', () => {
  let parentInjector: EnvironmentInjector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    parentInjector = TestBed.inject(EnvironmentInjector);
  });

  function createTestInjector(options?: { fieldKey?: string; initialValue?: unknown }): EnvironmentInjector {
    const fieldKey = options?.fieldKey || 'optionsField';
    const initialValue = signal({ [fieldKey]: options?.initialValue ?? '' });

    const testForm = runInInjectionContext(parentInjector, () => {
      return form(initialValue);
    });

    const mockContext: FieldSignalContext = {
      injector: parentInjector,
      value: initialValue,
      defaultValues: () => ({ [fieldKey]: '' }),
      form: testForm,
    };

    return createEnvironmentInjector([{ provide: FIELD_SIGNAL_CONTEXT, useValue: mockContext }], parentInjector);
  }

  function testMapper<T, TProps>(fieldDef: FieldWithOptions<T, TProps>, injector: EnvironmentInjector): Record<string, unknown> {
    const inputsSignal = runInInjectionContext(injector, () => optionsFieldMapper(fieldDef));
    return inputsSignal();
  }

  describe('select field', () => {
    it('should include options for select fields', () => {
      const selectField: SelectField<string> = {
        key: 'country',
        type: 'select',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'uk', label: 'United Kingdom' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'country' });
      const inputs = testMapper(selectField, injector);

      expect(inputs['options']).toEqual([
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'uk', label: 'United Kingdom' },
      ]);
    });

    it('should include base properties along with options', () => {
      const selectField: SelectField<string> = {
        key: 'country',
        type: 'select',
        label: 'Country',
        placeholder: 'Select a country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'country' });
      const inputs = testMapper(selectField, injector);

      expect(inputs['key']).toBe('country');
      expect(inputs['label']).toBe('Country');
      expect(inputs['placeholder']).toBe('Select a country');
      expect(inputs['options']).toHaveLength(2);
    });

    it('should handle empty options array', () => {
      const selectField: SelectField<string> = {
        key: 'empty',
        type: 'select',
        options: [],
      };

      const injector = createTestInjector({ fieldKey: 'empty' });
      const inputs = testMapper(selectField, injector);

      expect(inputs['options']).toEqual([]);
    });

    it('should handle numeric option values', () => {
      const selectField: SelectField<number> = {
        key: 'quantity',
        type: 'select',
        options: [
          { value: 1, label: 'One' },
          { value: 2, label: 'Two' },
          { value: 3, label: 'Three' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'quantity' });
      const inputs = testMapper(selectField, injector);

      expect(inputs['options']).toEqual([
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' },
        { value: 3, label: 'Three' },
      ]);
    });

    it('should handle object option values', () => {
      interface City {
        id: number;
        name: string;
      }

      const selectField: SelectField<City> = {
        key: 'city',
        type: 'select',
        options: [
          { value: { id: 1, name: 'NYC' }, label: 'New York City' },
          { value: { id: 2, name: 'LA' }, label: 'Los Angeles' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'city' });
      const inputs = testMapper(selectField, injector);

      expect(inputs['options']).toHaveLength(2);
      expect((inputs['options'] as Array<{ value: City }>)[0].value).toEqual({ id: 1, name: 'NYC' });
    });
  });

  describe('radio field', () => {
    it('should include options for radio fields', () => {
      const radioField: RadioField<string, unknown> = {
        key: 'gender',
        type: 'radio',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'gender' });
      const inputs = testMapper(radioField, injector);

      expect(inputs['options']).toEqual([
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
      ]);
    });

    it('should include base properties along with options for radio', () => {
      const radioField: RadioField<string, unknown> = {
        key: 'size',
        type: 'radio',
        label: 'Size',
        className: 'size-radio',
        options: [
          { value: 's', label: 'Small' },
          { value: 'm', label: 'Medium' },
          { value: 'l', label: 'Large' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'size' });
      const inputs = testMapper(radioField, injector);

      expect(inputs['key']).toBe('size');
      expect(inputs['label']).toBe('Size');
      expect(inputs['className']).toContain('size-radio');
      expect(inputs['options']).toHaveLength(3);
    });

    it('should handle boolean option values for radio', () => {
      const radioField: RadioField<boolean, unknown> = {
        key: 'agree',
        type: 'radio',
        options: [
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'agree' });
      const inputs = testMapper(radioField, injector);

      expect(inputs['options']).toEqual([
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ]);
    });
  });

  describe('multi-checkbox field', () => {
    it('should include options for multi-checkbox fields', () => {
      const multiCheckboxField: MultiCheckboxField<string> = {
        key: 'tags',
        type: 'multi-checkbox',
        options: [
          { value: 'tech', label: 'Technology' },
          { value: 'sports', label: 'Sports' },
          { value: 'music', label: 'Music' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'tags', initialValue: [] });
      const inputs = testMapper(multiCheckboxField, injector);

      expect(inputs['options']).toEqual([
        { value: 'tech', label: 'Technology' },
        { value: 'sports', label: 'Sports' },
        { value: 'music', label: 'Music' },
      ]);
    });

    it('should include base properties along with options for multi-checkbox', () => {
      const multiCheckboxField: MultiCheckboxField<string> = {
        key: 'interests',
        type: 'multi-checkbox',
        label: 'Interests',
        className: 'interests-checkbox',
        options: [
          { value: 'reading', label: 'Reading' },
          { value: 'gaming', label: 'Gaming' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'interests', initialValue: [] });
      const inputs = testMapper(multiCheckboxField, injector);

      expect(inputs['key']).toBe('interests');
      expect(inputs['label']).toBe('Interests');
      expect(inputs['className']).toContain('interests-checkbox');
      expect(inputs['options']).toHaveLength(2);
    });

    it('should handle numeric values for multi-checkbox', () => {
      const multiCheckboxField: MultiCheckboxField<number> = {
        key: 'selectedIds',
        type: 'multi-checkbox',
        options: [
          { value: 1, label: 'Item 1' },
          { value: 2, label: 'Item 2' },
          { value: 3, label: 'Item 3' },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'selectedIds', initialValue: [] });
      const inputs = testMapper(multiCheckboxField, injector);

      expect(inputs['options']).toEqual([
        { value: 1, label: 'Item 1' },
        { value: 2, label: 'Item 2' },
        { value: 3, label: 'Item 3' },
      ]);
    });
  });

  describe('options with additional properties', () => {
    it('should pass through option disabled property', () => {
      const selectField: SelectField<string> = {
        key: 'status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive', disabled: true },
        ],
      };

      const injector = createTestInjector({ fieldKey: 'status' });
      const inputs = testMapper(selectField, injector);

      expect((inputs['options'] as Array<{ disabled?: boolean }>)[1].disabled).toBe(true);
    });
  });

  describe('base value field properties', () => {
    it('should include key from base mapper', () => {
      const selectField: SelectField<string> = {
        key: 'test',
        type: 'select',
        options: [],
      };

      const injector = createTestInjector({ fieldKey: 'test' });
      const inputs = testMapper(selectField, injector);

      expect(inputs['key']).toBe('test');
    });

    it('should include tabIndex when defined', () => {
      const selectField: SelectField<string> = {
        key: 'test',
        type: 'select',
        tabIndex: 2,
        options: [],
      };

      const injector = createTestInjector({ fieldKey: 'test' });
      const inputs = testMapper(selectField, injector);

      expect(inputs['tabIndex']).toBe(2);
    });

    it('should include field proxy', () => {
      const selectField: SelectField<string> = {
        key: 'test',
        type: 'select',
        options: [],
      };

      const injector = createTestInjector({ fieldKey: 'test' });
      const inputs = testMapper(selectField, injector);

      expect(inputs).toHaveProperty('field');
    });

    it('should include validationMessages when defined', () => {
      const selectField: SelectField<string> = {
        key: 'country',
        type: 'select',
        options: [],
        validationMessages: {
          required: 'Please select a country',
        },
      };

      const injector = createTestInjector({ fieldKey: 'country' });
      const inputs = testMapper(selectField, injector);

      expect(inputs['validationMessages']).toEqual({
        required: 'Please select a country',
      });
    });
  });

  describe('excluded properties', () => {
    it('should NOT include type in inputs', () => {
      const selectField: SelectField<string> = {
        key: 'test',
        type: 'select',
        options: [],
      };

      const injector = createTestInjector({ fieldKey: 'test' });
      const inputs = testMapper(selectField, injector);

      expect(inputs).not.toHaveProperty('type');
    });
  });

  describe('complete field integration', () => {
    it('should correctly map a complete select field definition', () => {
      const selectField: SelectField<string> = {
        key: 'language',
        type: 'select',
        label: 'Preferred Language',
        placeholder: 'Select your language',
        className: 'language-select',
        tabIndex: 3,
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
        ],
        validationMessages: {
          required: 'Please select a language',
        },
      };

      const injector = createTestInjector({ fieldKey: 'language' });
      const inputs = testMapper(selectField, injector);

      // Base properties
      expect(inputs['key']).toBe('language');
      expect(inputs['label']).toBe('Preferred Language');
      expect(inputs['placeholder']).toBe('Select your language');
      expect(inputs['className']).toContain('language-select');
      expect(inputs['tabIndex']).toBe(3);

      // Options-specific
      expect(inputs['options']).toHaveLength(3);

      // Validation
      expect(inputs['validationMessages']).toEqual({
        required: 'Please select a language',
      });

      // Excluded
      expect(inputs).not.toHaveProperty('type');
    });
  });
});
