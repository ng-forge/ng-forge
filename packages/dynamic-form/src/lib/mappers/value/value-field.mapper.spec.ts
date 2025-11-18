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

  function createTestInjector(options?: {
    defaultValidationMessages?: Record<string, string>;
    withFieldProxy?: boolean;
    fieldKey?: string;
    isArrayField?: boolean;
    arrayIndex?: number;
  }): EnvironmentInjector {
    const fieldKey = options?.fieldKey || 'testField';
    const isArrayField = options?.isArrayField || false;
    const arrayIndex = options?.arrayIndex ?? 0;

    // For array fields, create initial value with array structure
    const initialValue = isArrayField ? signal({ [fieldKey]: ['value1', 'value2', 'value3'] }) : signal({ [fieldKey]: 'test value' });

    const testForm = runInInjectionContext(parentInjector, () => {
      return form(initialValue);
    });

    // Add field proxy if requested
    if (options?.withFieldProxy) {
      if (isArrayField) {
        // For array fields, create array structure with fieldProxy array
        (testForm as any).structure = {
          childrenMap: () =>
            new Map([
              [
                fieldKey,
                {
                  fieldProxy: [{ value: signal('value1') }, { value: signal('value2') }, { value: signal('value3') }],
                },
              ],
            ]),
        };
      } else {
        // For regular fields, create standard field proxy
        (testForm as any).structure = {
          childrenMap: () => new Map([[fieldKey, { fieldProxy: { value: signal('test value') } }]]),
        };
      }
    }

    const mockContext: FieldSignalContext = {
      injector: parentInjector,
      value: initialValue,
      defaultValues: () => (isArrayField ? { [fieldKey]: [] } : { [fieldKey]: '' }),
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

  describe('property binding creation', () => {
    it('should create correct number of bindings for provided properties', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'username',
        type: 'input',
        label: 'Username',
        className: 'username-class',
        tabIndex: 1,
        props: { hint: 'Enter your username' },
        validationMessages: { required: 'Username is required' },
      };

      const injector = createTestInjector({ fieldKey: 'username' });

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
      const fieldDef: BaseValueField<any, any> = {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        // className, tabIndex, props are undefined
      };

      const injector = createTestInjector({ fieldKey: 'email' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages = 3 bindings minimum
      expect(bindings.length).toBeGreaterThanOrEqual(3);
    });

    it('should always include validationMessages binding even when undefined', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'phone',
        type: 'input',
        label: 'Phone Number',
        // validationMessages is undefined
      };

      const injector = createTestInjector({ fieldKey: 'phone' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // validationMessages binding should always be present
      expect(bindings.length).toBeGreaterThanOrEqual(3); // key + label + validationMessages
    });

    it('should create binding for validationMessages with custom messages', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'password',
        type: 'input',
        label: 'Password',
        validationMessages: {
          required: 'Password is required',
          minLength: 'Password must be at least 8 characters',
          pattern: 'Password must contain uppercase, lowercase, and numbers',
        },
      };

      const injector = createTestInjector({ fieldKey: 'password' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings.length).toBeGreaterThanOrEqual(3);
    });

    it('should include defaultValidationMessages binding when present in context', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
      };

      const injector = createTestInjector({
        fieldKey: 'firstName',
        defaultValidationMessages: { required: 'This field is required' },
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages + defaultValidationMessages = 4 bindings minimum
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });

    it('should not include defaultValidationMessages binding when undefined in context', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
      };

      const injector = createTestInjector({ fieldKey: 'lastName' });

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
      const fieldDef: BaseValueField<any, any> = {
        key: 'description',
        type: 'textarea',
        label: 'Description',
      };

      const injector = createTestInjector({
        fieldKey: 'description',
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
      const fieldDef: BaseValueField<any, any> = {
        key: 'nonExistent',
        type: 'input',
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
      const fieldDef: BaseValueField<any, any> = {
        key: 'simpleField',
        type: 'input',
        label: 'Simple',
      };

      const injector = createTestInjector({ fieldKey: 'simpleField' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings).toHaveLength(4); // key + label + validationMessages + className (from grid)
    });

    it('should handle form context with null childrenMap', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'nullMapTest',
        type: 'input',
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
      const fieldDef: BaseValueField<any, any> = {
        key: 'combined',
        type: 'input',
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

  describe('array field notation handling', () => {
    it('should handle array notation field key (e.g., tags[0])', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'tags[0]',
        type: 'input',
        label: 'Tag 0',
      };

      const injector = createTestInjector({
        fieldKey: 'tags',
        isArrayField: true,
        withFieldProxy: true,
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // Should include field binding for array element
      expect(bindings.length).toBeGreaterThanOrEqual(4); // key + label + validationMessages + field
    });

    it('should handle array notation with different indices', () => {
      // Arrange
      const fieldDef1: BaseValueField<any, any> = {
        key: 'items[0]',
        type: 'input',
        label: 'Item 0',
      };

      const fieldDef2: BaseValueField<any, any> = {
        key: 'items[2]',
        type: 'input',
        label: 'Item 2',
      };

      const injector = createTestInjector({
        fieldKey: 'items',
        isArrayField: true,
        withFieldProxy: true,
      });

      // Act
      const bindings1 = testMapper(fieldDef1, injector);
      const bindings2 = testMapper(fieldDef2, injector);

      // Assert
      expect(bindings1.length).toBeGreaterThanOrEqual(4);
      expect(bindings2.length).toBeGreaterThanOrEqual(4);
    });

    it('should not create field binding for array notation when fieldProxy does not exist', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'missing[0]',
        type: 'input',
        label: 'Missing Array Item',
      };

      const injector = createTestInjector({ fieldKey: 'missing' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages = 3 bindings (no field binding)
      expect(bindings).toHaveLength(3);
    });

    it('should handle array notation with validationMessages', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'emails[1]',
        type: 'input',
        label: 'Email 1',
        validationMessages: { email: 'Invalid email address' },
      };

      const injector = createTestInjector({
        fieldKey: 'emails',
        isArrayField: true,
        withFieldProxy: true,
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });

    it('should parse array notation correctly with large indices', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'data[99]',
        type: 'input',
        label: 'Data 99',
      };

      const injector = createTestInjector({
        fieldKey: 'data',
        isArrayField: true,
        withFieldProxy: true,
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // Even if index is out of bounds, binding creation should not fail
      expect(bindings.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle array notation with field proxy and defaultValidationMessages', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'addresses[0]',
        type: 'input',
        label: 'Address 0',
      };

      const injector = createTestInjector({
        fieldKey: 'addresses',
        isArrayField: true,
        withFieldProxy: true,
        defaultValidationMessages: { required: 'Address is required' },
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
      const fieldDef: BaseValueField<any, any> = {
        key: 'hasValue',
        type: 'input',
        label: 'Has Value',
        value: 'initial value', // This should be omitted
      };

      const injector = createTestInjector({ fieldKey: 'hasValue' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + validationMessages + className (from grid) = 4 bindings
      // value should not create a binding
      expect(bindings).toHaveLength(4);
    });

    it('should handle field with value as empty string', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'emptyValue',
        type: 'input',
        label: 'Empty Value',
        value: '',
      };

      const injector = createTestInjector({ fieldKey: 'emptyValue' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings).toHaveLength(4); // value should still be omitted
    });

    it('should handle field with value as number', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'numericValue',
        type: 'number',
        label: 'Numeric Value',
        value: 42,
      };

      const injector = createTestInjector({ fieldKey: 'numericValue' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings).toHaveLength(4); // value should be omitted
    });

    it('should handle field with value as boolean', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'boolValue',
        type: 'checkbox',
        label: 'Boolean Value',
        value: true,
      };

      const injector = createTestInjector({ fieldKey: 'boolValue' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings).toHaveLength(4); // value should be omitted
    });

    it('should handle field with value as null', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'nullValue',
        type: 'input',
        label: 'Null Value',
        value: null,
      };

      const injector = createTestInjector({ fieldKey: 'nullValue' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings).toHaveLength(4); // value should be omitted
    });

    it('should omit value even with other properties present', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'complexValue',
        type: 'input',
        label: 'Complex Value',
        className: 'test-class',
        value: 'test',
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
      const fieldDef: BaseValueField<any, any> = {
        key: 'minimal',
        type: 'input',
      };

      const injector = createTestInjector({ fieldKey: 'minimal' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + validationMessages = 2 bindings minimum
      expect(bindings.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty validationMessages object', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'emptyMessages',
        type: 'input',
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
      const fieldDef: BaseValueField<any, any> = {
        key: 'nullMessages',
        type: 'input',
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
      const fieldDef: BaseValueField<any, any> = {
        key: 'customProps',
        type: 'input',
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

    it('should handle field with placeholder', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'withPlaceholder',
        type: 'input',
        label: 'With Placeholder',
        placeholder: 'Enter value here',
      };

      const injector = createTestInjector({ fieldKey: 'withPlaceholder' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + placeholder + validationMessages = 4 bindings
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle field with required validation', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'requiredField',
        type: 'input',
        label: 'Required Field',
        required: true,
        validationMessages: { required: 'This field is required' },
      };

      const injector = createTestInjector({ fieldKey: 'requiredField' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle field with different value types (object)', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'objectValue',
        type: 'input',
        label: 'Object Value',
        value: { nested: 'value' },
      };

      const injector = createTestInjector({ fieldKey: 'objectValue' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings).toHaveLength(4); // value should be omitted
    });

    it('should handle field with different value types (array)', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'arrayValue',
        type: 'input',
        label: 'Array Value',
        value: ['item1', 'item2'],
      };

      const injector = createTestInjector({ fieldKey: 'arrayValue' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings).toHaveLength(4); // value should be omitted
    });
  });

  describe('integration scenarios', () => {
    it('should create correct binding count for complex field definition', () => {
      // Arrange
      const complexFieldDef: BaseValueField<any, any> = {
        key: 'complexField',
        type: 'input',
        label: 'Complex Field',
        className: 'complex-class',
        tabIndex: 5,
        props: { hint: 'This is a complex field' },
        placeholder: 'Enter here',
        validationMessages: {
          required: 'This field is required',
        },
        value: 'initial',
      };

      const injector = createTestInjector({ fieldKey: 'complexField' });

      // Act
      const bindings = testMapper(complexFieldDef, injector);

      // Assert
      // key + label + className + tabIndex + props + placeholder + validationMessages
      // (value is omitted)
      expect(bindings.length).toBeGreaterThanOrEqual(7);
    });

    it('should handle field with both validationMessages and defaultValidationMessages', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'doubleMessages',
        type: 'input',
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
      const fieldDef: BaseValueField<any, any> = {
        key: 'fullFeatures',
        type: 'input',
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

    it('should work with custom props on value field', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'customProps',
        type: 'input',
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
      const fieldDef: BaseValueField<any, any> = {
        key: 'allFeatures',
        type: 'input',
        label: 'All Features',
        className: 'all-features',
        tabIndex: 1,
        placeholder: 'Placeholder',
        props: { hint: 'Hint' },
        validationMessages: { required: 'Required' },
        value: 'test',
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
      const fieldDef1: BaseValueField<any, any> = {
        key: 'field1',
        type: 'input',
        label: 'Field 1',
      };

      const fieldDef2: BaseValueField<any, any> = {
        key: 'field2',
        type: 'input',
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

    it('should handle array field with all features', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'skills[2]',
        type: 'input',
        label: 'Skill 2',
        className: 'skill-input',
        tabIndex: 3,
        placeholder: 'Enter skill',
        props: { hint: 'Add a skill' },
        validationMessages: { required: 'Skill is required' },
        value: 'JavaScript',
      };

      const injector = createTestInjector({
        fieldKey: 'skills',
        isArrayField: true,
        withFieldProxy: true,
        defaultValidationMessages: { minLength: 'Too short' },
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // key + label + className + tabIndex + placeholder + props + validationMessages + defaultValidationMessages + field
      // (value is omitted)
      expect(bindings.length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('validationMessages handling', () => {
    it('should create validationMessages binding with undefined value as empty object', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'test',
        type: 'input',
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
      const fieldDef: BaseValueField<any, any> = {
        key: 'multiValidation',
        type: 'input',
        label: 'Multi Validation',
        validationMessages: {
          required: 'Required message',
          minLength: 'Min length message',
          maxLength: 'Max length message',
          pattern: 'Pattern message',
          email: 'Email message',
        },
      };

      const injector = createTestInjector({ fieldKey: 'multiValidation' });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      expect(bindings.length).toBeGreaterThanOrEqual(3);
    });

    it('should include both field-specific and default validation messages', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'override',
        type: 'input',
        label: 'Override',
        validationMessages: { required: 'Field-specific required' },
      };

      const injector = createTestInjector({
        fieldKey: 'override',
        defaultValidationMessages: { required: 'Default required', email: 'Default email' },
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // Both validationMessages and defaultValidationMessages should be present
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle empty defaultValidationMessages object', () => {
      // Arrange
      const fieldDef: BaseValueField<any, any> = {
        key: 'emptyDefault',
        type: 'input',
        label: 'Empty Default',
      };

      const injector = createTestInjector({
        fieldKey: 'emptyDefault',
        defaultValidationMessages: {},
      });

      // Act
      const bindings = testMapper(fieldDef, injector);

      // Assert
      // defaultValidationMessages should still be included even if empty
      expect(bindings.length).toBeGreaterThanOrEqual(4);
    });
  });
});
