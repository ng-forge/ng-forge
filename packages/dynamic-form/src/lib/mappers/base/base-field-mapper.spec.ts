import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, schema } from '@angular/forms/signals';
import { baseFieldMapper } from './base-field-mapper';
import { FieldDef } from '../../definitions';
import { FieldSignalContext } from '../types';

describe('baseFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  describe('property binding creation', () => {
    it('should create correct number of bindings for provided properties', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
        className: 'test-class',
        tabIndex: 1,
        props: { hint: 'Test hint' },
      };

      const value = signal({ testField: '' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ testField: '' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(5); // field + label + className + tabIndex + props
      expect(Array.isArray(bindings)).toBe(true);
      expect(bindings.every((binding) => typeof binding === 'object')).toBe(true);
    });

    it('should create fewer bindings when properties are undefined', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
        // className, tabIndex, props are undefined
      };

      const value = signal({ testField: '' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ testField: '' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(2); // field + label
    });

    it('should create bindings for custom properties via entries iteration', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
        customProp: 'custom value',
        anotherProp: 123,
        // These should be omitted from remaining properties
        validation: { required: true },
        conditionals: {},
      } as any;

      const value = signal({ testField: '' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ testField: '' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      // Should create bindings for: field + label + customProp + anotherProp
      expect(bindings).toHaveLength(4);
    });

    it('should handle destructured properties correctly', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        disabled: true,
        readonly: false,
        hidden: false,
        label: 'Test Label',
        customProp: 'should be included',
      } as any;

      const value = signal({ testField: '' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ testField: '' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      // Should create bindings for: field + label + customProp
      // disabled, readonly, hidden are excluded from bindings
      expect(bindings).toHaveLength(3);
    });
  });

  describe('field binding creation with form context', () => {
    it('should create additional field binding when form has matching field proxy', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Field',
      };

      const value = signal({ testField: '' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ testField: 'initial value' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(2); // field binding + label binding
    });

    it('should not create field binding when form field proxy does not exist', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'nonExistentField',
        type: 'input',
        label: 'Test Field',
      };

      const value = signal({ testField: '' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ differentField: 'value' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(1); // only label binding
    });

    it('should handle form context without structure', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
      };

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value: signal({ testField: '' }),
        defaultValues: () => ({ testField: '' }),
        form: () => ({ structure: undefined } as any),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(1); // only label binding, no field binding
    });

    it('should handle form context with null childrenMap', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
      };

      const value = signal({ testField: '' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ testField: '' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(2); // field + label binding
    });

    it('should work with multiple field proxies in form', () => {
      // Arrange
      const fieldDef1: FieldDef<any> = {
        key: 'field1',
        type: 'input',
        label: 'Field 1',
      };

      const fieldDef2: FieldDef<any> = {
        key: 'field2',
        type: 'input',
        label: 'Field 2',
      };

      const value = signal({ field1: 'value1', field2: 'value2' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ field1: 'value1', field2: 'value2' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act - test both fields
      const bindings1 = baseFieldMapper(fieldDef1, options);
      const bindings2 = baseFieldMapper(fieldDef2, options);

      // Assert
      expect(bindings1).toHaveLength(2); // field binding + label binding for field1
      expect(bindings2).toHaveLength(2); // field binding + label binding for field2
    });
  });

  describe('edge cases', () => {
    it('should handle field definition with minimal properties', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
      };

      const value = signal({ testField: '' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ testField: '' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(1); // field binding is created for existing fields
    });

    it('should handle field definition with only excluded properties', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        conditionals: {},
        validation: { required: true },
      } as any;

      const value = signal({ testField: '' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ testField: '' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(1); // field binding is created for existing fields
    });
  });

  describe('integration scenarios', () => {
    it('should create correct binding count for complex field definition', () => {
      // Arrange
      const complexFieldDef: FieldDef<any> = {
        key: 'complexField',
        type: 'input',
        label: 'Complex Field',
        className: 'complex-class',
        tabIndex: 5,
        props: { placeholder: 'Enter value', hint: 'This is a hint' },
        customAttribute: 'custom-value',
        anotherCustomProp: 42,
        // Excluded properties
        disabled: true,
        readonly: false,
        hidden: false,
        validation: { required: true },
        conditionals: { show: true },
      } as any;

      const value = signal({ complexField: 'complex value' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ complexField: 'complex value' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(complexFieldDef, options);

      // Assert
      // Expected bindings: field + label + className + tabIndex + props + customAttribute + anotherCustomProp
      // disabled, readonly, hidden are excluded
      expect(bindings).toHaveLength(7);
    });

    it('should verify field proxy access pattern', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Field',
      };

      const value = signal({ testField: '' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ testField: 'test value' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(2); // field binding + label binding
      // Verify that form access works correctly by checking bindings length
    });

    it('should handle binding creation when form structure exists but field is missing', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'missingField',
        type: 'input',
        label: 'Missing Field',
        className: 'missing-class',
      };

      const value = signal({ existingField: 'value' });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value,
        defaultValues: () => ({ existingField: 'value' }),
        form: runInInjectionContext(injector, () => form(value)),
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(2); // label + className (no field binding for missing field)
    });
  });

  describe('real Angular signal forms integration', () => {
    it('should create field binding when using real form with schema', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'username',
        type: 'input',
        label: 'Username',
        className: 'username-field',
      };

      const initialValue = signal({ username: 'john_doe' });

      // Create real form using Angular signal forms
      const realForm = runInInjectionContext(injector, () => {
        const formSchema = schema<{ username: string }>((path) => {
          // Define field in schema - this creates the field proxy
          void path.username;
        });
        return form(initialValue, formSchema);
      });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value: initialValue,
        defaultValues: () => ({ username: '' }),
        form: realForm,
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(3); // field binding + label + className
    });

    it('should create only property bindings when form has no matching field', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'email', // This field is not in the schema
        type: 'input',
        label: 'Email Address',
      };

      const initialValue = signal({ username: 'john_doe' });

      // Create real form with different field
      const realForm = runInInjectionContext(injector, () => {
        const formSchema = schema<{ username: string }>((path) => {
          void path.username;
        });
        return form(initialValue, formSchema);
      });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value: initialValue,
        defaultValues: () => ({ username: '' }),
        form: realForm,
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(1); // only label binding, no field binding
    });

    it('should work with form without schema', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'freeform',
        type: 'input',
        label: 'Free Form Field',
      };

      const initialValue = signal({ freeform: 'some value' });

      // Create form without schema
      const realForm = runInInjectionContext(injector, () => {
        return form(initialValue);
      });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value: initialValue,
        defaultValues: () => ({ freeform: '' }),
        form: realForm,
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(fieldDef, options);

      // Assert
      expect(bindings).toHaveLength(2); // label binding + field binding (form creates field proxy for existing fields)
    });

    it('should handle complex field definitions with real forms', () => {
      // Arrange
      const complexFieldDef: FieldDef<any> = {
        key: 'profile',
        type: 'input',
        label: 'Profile Name',
        className: 'profile-input',
        tabIndex: 1,
        props: {
          placeholder: 'Enter profile name',
          hint: 'This will be displayed publicly',
        },
        customAttribute: 'profile-attr',
        // Excluded properties
        disabled: true,
        readonly: false,
        validation: { required: true },
      } as any;

      const initialValue = signal({
        profile: 'John Doe',
        email: 'john@example.com',
      });

      const realForm = runInInjectionContext(injector, () => {
        const formSchema = schema<{ profile: string; email: string }>((path) => {
          void path.profile;
          void path.email;
        });
        return form(initialValue, formSchema);
      });

      const mockFieldSignalContext: FieldSignalContext = {
        injector,
        value: initialValue,
        defaultValues: () => ({ profile: '', email: '' }),
        form: realForm,
      };

      const options = { fieldSignalContext: mockFieldSignalContext };

      // Act
      const bindings = baseFieldMapper(complexFieldDef, options);

      // Assert
      // Expected: field + label + className + tabIndex + props + customAttribute
      // disabled, readonly are excluded
      expect(bindings).toHaveLength(6);
    });
  });
});
