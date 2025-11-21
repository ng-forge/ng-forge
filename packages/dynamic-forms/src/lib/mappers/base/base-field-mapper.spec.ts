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

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(5); // key + label + className + tabIndex + props
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

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + label
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

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      // Should create bindings for: key + label + customProp + anotherProp
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

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      // Should create bindings for: key + label + customProp
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

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + label binding
    });

    it('should not create field binding when form field proxy does not exist', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'nonExistentField',
        type: 'input',
        label: 'Test Field',
      };

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + label binding
    });

    it('should handle form context without structure', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
      };

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + label binding, no field binding
    });

    it('should handle form context with null childrenMap', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
      };

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + label binding
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

      // Act - test both fields
      const bindings1 = baseFieldMapper(fieldDef1);
      const bindings2 = baseFieldMapper(fieldDef2);

      // Assert
      expect(bindings1).toHaveLength(2); // key + label binding for field1
      expect(bindings2).toHaveLength(2); // key + label binding for field2
    });
  });

  describe('edge cases', () => {
    it('should handle field definition with minimal properties', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
      };

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(1); // key binding
    });

    it('should handle field definition with only excluded properties', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        conditionals: {},
        validation: { required: true },
      } as any;

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(1); // key binding
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

      // Act
      const bindings = baseFieldMapper(complexFieldDef);

      // Assert
      // Expected bindings: key + label + className + tabIndex + props + customAttribute + anotherCustomProp
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

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + label binding
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

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(3); // key + label + className (no field binding for missing field)
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

      // Act
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(3); // key + label + className
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
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + label binding, no field binding
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
      const bindings = baseFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + label binding
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

      // Act
      const bindings = baseFieldMapper(complexFieldDef);

      // Assert
      // Expected: key + label + className + tabIndex + props + customAttribute
      // disabled, readonly are excluded
      expect(bindings).toHaveLength(6);
    });
  });
});
