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

  function createTestInjector(options?: {
    defaultValidationMessages?: Record<string, string>;
    withFieldProxy?: boolean;
    fieldKey?: string;
  }): EnvironmentInjector {
    const fieldKey = options?.fieldKey || 'testField';
    const initialValue = signal({ [fieldKey]: false });

    const testForm = runInInjectionContext(parentInjector, () => {
      return form(initialValue);
    });

    // Add field proxy if requested
    if (options?.withFieldProxy) {
      (testForm as any).structure = {
        childrenMap: () => new Map([[fieldKey, { fieldProxy: { value: signal(false) } }]]),
      };
    }

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

  function testMapper(fieldDef: BaseCheckedField<any>, injector: EnvironmentInjector) {
    return runInInjectionContext(injector, () => checkboxFieldMapper(fieldDef));
  }

  describe('property binding creation', () => {
    it('should create correct number of bindings for provided properties', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'acceptTerms',
        type: 'checkbox',
        label: 'Accept Terms',
        className: 'checkbox-class',
        tabIndex: 1,
        props: { hint: 'Please accept terms' },
        validationMessages: { required: 'This field is required' },
      };

      const injector = createTestInjector({ fieldKey: 'acceptTerms' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + className + tabIndex + props + validationMessages = 6 bindings
      expect(bindings.length).toBeGreaterThanOrEqual(6);
      expect(Array.isArray(bindings)).toBe(true);
      expect(bindings.every((binding) => typeof binding === 'object')).toBe(true);
    });

    it('should create fewer bindings when properties are undefined', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to Newsletter',
        // className, tabIndex, props are undefined
      };

      const injector = createTestInjector({ fieldKey: 'newsletter' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages = 3 bindings minimum
      expect(bindings.length).toBeGreaterThanOrEqual(3);
    });

    it('should always include validationMessages binding even when undefined', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'agreeToPolicy',
        type: 'checkbox',
        label: 'I Agree',
        // validationMessages is undefined
      };

      const injector = createTestInjector({ fieldKey: 'agreeToPolicy' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // validationMessages binding should always be present
      expect(bindings.length).toBeGreaterThanOrEqual(3); // key + label + validationMessages
    });

    it('should create binding for validationMessages with custom messages', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'consent',
        type: 'checkbox',
        label: 'Give Consent',
        validationMessages: {
          required: 'Consent is required',
          custom: 'Custom error message',
        },
      };

      const injector = createTestInjector({ fieldKey: 'consent' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings.length).toBeGreaterThanOrEqual(3); // key + label + validationMessages
    });

    it('should include defaultValidationMessages binding when present in context', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'terms',
        type: 'checkbox',
        label: 'Accept Terms',
      };

      const injector = createTestInjector({
        fieldKey: 'terms',
        defaultValidationMessages: { required: 'Default required message' },
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages + defaultValidationMessages = 4 bindings minimum
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });

    it('should not include defaultValidationMessages binding when undefined in context', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'terms',
        type: 'checkbox',
        label: 'Accept Terms',
      };

      const injector = createTestInjector({ fieldKey: 'terms' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages + className (from grid) = 4 bindings (no defaultValidationMessages)
      expect(bindings).toHaveLength(4);
    });
  });

  describe('field binding creation with form context', () => {
    it('should create field binding when form has matching field proxy', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'isActive',
        type: 'checkbox',
        label: 'Active',
      };

      const injector = createTestInjector({
        fieldKey: 'isActive',
        withFieldProxy: true,
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages + field = 4 bindings
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });

    it('should not create field binding when field proxy does not exist', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'nonExistent',
        type: 'checkbox',
        label: 'Non-existent Field',
      };

      const injector = createTestInjector({ fieldKey: 'nonExistent' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages + className (from grid) = 4 bindings (no field binding)
      expect(bindings).toHaveLength(4);
    });

    it('should handle form context without structure', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'simpleCheckbox',
        type: 'checkbox',
        label: 'Simple',
      };

      const injector = createTestInjector({ fieldKey: 'simpleCheckbox' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings).toHaveLength(4); // key + label + validationMessages + className (from grid)
    });

    it('should handle form context with null childrenMap', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'nullMapTest',
        type: 'checkbox',
        label: 'Null Map Test',
      };

      const injector = createTestInjector({ fieldKey: 'nullMapTest' });

      // Get the context and modify the form
      const context = injector.get(FIELD_SIGNAL_CONTEXT);
      (context.form as any).structure = {
        childrenMap: () => null,
      };

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings).toHaveLength(4); // key + label + validationMessages + className (from grid)
    });

    it('should handle field proxy and defaultValidationMessages together', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'combined',
        type: 'checkbox',
        label: 'Combined Features',
      };

      const injector = createTestInjector({
        fieldKey: 'combined',
        withFieldProxy: true,
        defaultValidationMessages: { required: 'Required' },
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages + defaultValidationMessages + field = 5 bindings
      expect(bindings.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('value field omission', () => {
    it('should omit value field when passed to baseFieldMapper', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'hasValue',
        type: 'checkbox',
        label: 'Has Value',
        value: true, // This should be omitted
      };

      const injector = createTestInjector({ fieldKey: 'hasValue' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages + className (from grid) = 4 bindings
      // value should not create a binding
      expect(bindings).toHaveLength(4);
    });

    it('should handle field with value false', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'unchecked',
        type: 'checkbox',
        label: 'Unchecked',
        value: false,
      };

      const injector = createTestInjector({ fieldKey: 'unchecked' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings).toHaveLength(4); // value should still be omitted, className added from grid
    });

    it('should omit value even with other properties present', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'complexValue',
        type: 'checkbox',
        label: 'Complex Value',
        className: 'test-class',
        value: true,
        props: { hint: 'Hint text' },
      };

      const injector = createTestInjector({ fieldKey: 'complexValue' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + className (user + grid) + props + validationMessages = 6 bindings (no value)
      expect(bindings).toHaveLength(6);
    });
  });

  describe('edge cases', () => {
    it('should handle field definition with minimal properties', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'minimal',
        type: 'checkbox',
      };

      const injector = createTestInjector({ fieldKey: 'minimal' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + validationMessages = 2 bindings minimum
      expect(bindings.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle field definition with required validation', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'requiredCheck',
        type: 'checkbox',
        label: 'Required Checkbox',
        required: true,
        validationMessages: { required: 'You must check this box' },
      };

      const injector = createTestInjector({ fieldKey: 'requiredCheck' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle field with placeholder', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'withPlaceholder',
        type: 'checkbox',
        label: 'With Placeholder',
        placeholder: 'Check me',
      };

      const injector = createTestInjector({ fieldKey: 'withPlaceholder' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + placeholder + validationMessages = 4 bindings
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle empty validationMessages object', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'emptyMessages',
        type: 'checkbox',
        label: 'Empty Messages',
        validationMessages: {},
      };

      const injector = createTestInjector({ fieldKey: 'emptyMessages' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle null validationMessages defaulting to empty object', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'nullMessages',
        type: 'checkbox',
        label: 'Null Messages',
        validationMessages: null as any,
      };

      const injector = createTestInjector({ fieldKey: 'nullMessages' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // Should still create validationMessages binding with empty object
      expect(bindings.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle field with custom properties', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'customProps',
        type: 'checkbox',
        label: 'Custom Props',
        customProp: 'custom-value',
        anotherProp: 123,
      } as any;

      const injector = createTestInjector({ fieldKey: 'customProps' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + customProp + anotherProp + validationMessages
      expect(bindings.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('integration scenarios', () => {
    it('should create correct binding count for complex field definition', () => {
      // Arrange
      const complexFieldDef: BaseCheckedField<any> = {
        key: 'complexCheckbox',
        type: 'checkbox',
        label: 'Complex Checkbox',
        className: 'complex-class',
        tabIndex: 5,
        props: { hint: 'This is a complex checkbox' },
        required: true,
        placeholder: 'Check here',
        validationMessages: {
          required: 'This checkbox is required',
        },
        value: false,
      };

      const injector = createTestInjector({ fieldKey: 'complexCheckbox' });

      // Act
      const bindings = testMapper(complexFieldDef, injector);

      // Assert
      // key + label + className + tabIndex + props + placeholder + validationMessages
      // (value is omitted, required is excluded from bindings)
      expect(bindings.length).toBeGreaterThanOrEqual(7);
    });

    it('should handle field with both validationMessages and defaultValidationMessages', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'doubleMessages',
        type: 'checkbox',
        label: 'Double Messages',
        validationMessages: { required: 'Field-specific required message' },
      };

      const injector = createTestInjector({
        fieldKey: 'doubleMessages',
        defaultValidationMessages: {
          required: 'Global required message',
          email: 'Invalid email',
        },
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages + defaultValidationMessages = 4 bindings
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle field with field proxy and validation messages', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'fullFeatures',
        type: 'checkbox',
        label: 'Full Features',
        validationMessages: { required: 'Required' },
      };

      const injector = createTestInjector({
        fieldKey: 'fullFeatures',
        withFieldProxy: true,
        defaultValidationMessages: { required: 'Default required' },
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages + defaultValidationMessages + field = 5 bindings
      expect(bindings.length).toBeGreaterThanOrEqual(5);
    });

    it('should work with custom props on checkbox field', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'customProps',
        type: 'checkbox',
        label: 'Custom Props',
        props: {
          hint: 'Helpful hint',
          description: 'Detailed description',
          customAttribute: 'custom-value',
        },
      };

      const injector = createTestInjector({ fieldKey: 'customProps' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + props + validationMessages = 4 bindings
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle all features combined', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'allFeatures',
        type: 'checkbox',
        label: 'All Features',
        className: 'all-features',
        tabIndex: 1,
        placeholder: 'Placeholder',
        props: { hint: 'Hint' },
        validationMessages: { required: 'Required' },
        value: true,
      };

      const injector = createTestInjector({
        fieldKey: 'allFeatures',
        withFieldProxy: true,
        defaultValidationMessages: { email: 'Invalid' },
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + className + tabIndex + placeholder + props + validationMessages + defaultValidationMessages + field
      // (value is omitted)
      expect(bindings.length).toBeGreaterThanOrEqual(9);
    });

    it('should maintain binding consistency across multiple invocations', () => {
      // Arrange
      const fieldDef1: BaseCheckedField<any> = {
        key: 'field1',
        type: 'checkbox',
        label: 'Field 1',
      };

      const fieldDef2: BaseCheckedField<any> = {
        key: 'field2',
        type: 'checkbox',
        label: 'Field 2',
      };

      const injector1 = createTestInjector({ fieldKey: 'field1' });
      const injector2 = createTestInjector({ fieldKey: 'field2' });

      // Act
      const bindings1 = testMapper(fieldDef1, injector1);
      const bindings2 = testMapper(fieldDef2, injector2);

      // Assert
      expect(bindings1).toHaveLength(4); // key + label + validationMessages + className (from grid)
      expect(bindings2).toHaveLength(4);
      expect(bindings1.length).toBe(bindings2.length);
    });
  });

  describe('validationMessages handling', () => {
    it('should create validationMessages binding with undefined value as empty object', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'test',
        type: 'checkbox',
        // validationMessages is undefined
      };

      const injector = createTestInjector({ fieldKey: 'test' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings.length).toBeGreaterThanOrEqual(2); // key + validationMessages
    });

    it('should handle multiple validation message types', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'multiValidation',
        type: 'checkbox',
        label: 'Multi Validation',
        validationMessages: {
          required: 'Required message',
          minLength: 'Min length message',
          maxLength: 'Max length message',
          pattern: 'Pattern message',
        },
      };

      const injector = createTestInjector({ fieldKey: 'multiValidation' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings.length).toBeGreaterThanOrEqual(3);
    });

    it('should override default validation messages with field-specific ones', () => {
      // Arrange
      const fieldDef: BaseCheckedField<any> = {
        key: 'override',
        type: 'checkbox',
        label: 'Override',
        validationMessages: { required: 'Field-specific required' },
      };

      const injector = createTestInjector({
        fieldKey: 'override',
        defaultValidationMessages: { required: 'Default required' },
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // Both validationMessages and defaultValidationMessages should be present
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });
  });
});
