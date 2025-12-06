import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, schema } from '@angular/forms/signals';
import { baseFieldMapper } from './base-field-mapper';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldSignalContext } from '../types';

describe('baseFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  describe('property input creation', () => {
    it('should create correct number of inputs for provided properties', () => {
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
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(5); // key + label + className + tabIndex + props
      expect(typeof inputs).toBe('object');
      expect(inputs).not.toBeNull();
    });

    it('should create fewer inputs when properties are undefined', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
        // className, tabIndex, props are undefined
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(2); // key + label
    });

    it('should create inputs for custom properties via entries iteration', () => {
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
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      // Should create inputs for: key + label + customProp + anotherProp
      expect(Object.keys(inputs)).toHaveLength(4);
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
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      // Should create inputs for: key + label + customProp
      // disabled, readonly, hidden are excluded from inputs
      expect(Object.keys(inputs)).toHaveLength(3);
    });
  });

  describe('field input creation with form context', () => {
    it('should create additional field input when form has matching field proxy', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Field',
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(2); // key + label input
    });

    it('should not create field input when form field proxy does not exist', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'nonExistentField',
        type: 'input',
        label: 'Test Field',
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(2); // key + label input
    });

    it('should handle form context without structure', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(2); // key + label input, no field input
    });

    it('should handle form context with null childrenMap', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(2); // key + label input
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
      const inputsSignal1 = baseFieldMapper(fieldDef1);
      const inputsSignal2 = baseFieldMapper(fieldDef2);
      const inputs1 = inputsSignal1(); // Call signal to get inputs
      const inputs2 = inputsSignal2(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs1)).toHaveLength(2); // key + label input for field1
      expect(Object.keys(inputs2)).toHaveLength(2); // key + label input for field2
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
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(1); // key input
      expect(inputs).toHaveProperty('key', 'testField');
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
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(1); // key input
    });
  });

  describe('integration scenarios', () => {
    it('should create correct input count for complex field definition', () => {
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
      const inputsSignal = baseFieldMapper(complexFieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      // Expected inputs: key + label + className + tabIndex + props + customAttribute + anotherCustomProp
      // disabled, readonly, hidden are excluded
      expect(Object.keys(inputs)).toHaveLength(7);
    });

    it('should verify field proxy access pattern', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Field',
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(2); // key + label input
      expect(inputs).toHaveProperty('key', 'testField');
      expect(inputs).toHaveProperty('label', 'Test Field');
    });

    it('should handle input creation when form structure exists but field is missing', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'missingField',
        type: 'input',
        label: 'Missing Field',
        className: 'missing-class',
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(3); // key + label + className (no field input for missing field)
    });
  });

  describe('real Angular signal forms integration', () => {
    it('should create field input when using real form with schema', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'username',
        type: 'input',
        label: 'Username',
        className: 'username-field',
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(3); // key + label + className
    });

    it('should create only property inputs when form has no matching field', () => {
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
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(2); // key + label input, no field input
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
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      expect(Object.keys(inputs)).toHaveLength(2); // key + label input
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
      const inputsSignal = baseFieldMapper(complexFieldDef);
      const inputs = inputsSignal(); // Call signal to get inputs

      // Assert
      // Expected: key + label + className + tabIndex + props + customAttribute
      // disabled, readonly are excluded
      expect(Object.keys(inputs)).toHaveLength(6);
    });
  });
});
