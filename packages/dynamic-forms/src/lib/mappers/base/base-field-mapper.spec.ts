import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, schema } from '@angular/forms/signals';
import { baseFieldMapper, buildBaseInputs } from './base-field-mapper';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldSignalContext } from '../types';

describe('baseFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  describe('buildBaseInputs (inclusion-based)', () => {
    it('should only include explicitly mapped properties: key, label, className, tabIndex, props', () => {
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
      const inputs = buildBaseInputs(fieldDef);

      // Assert - key + label + className + tabIndex + props (NOT type)
      expect(Object.keys(inputs)).toHaveLength(5);
      expect(inputs).toHaveProperty('key', 'testField');
      expect(inputs).toHaveProperty('label', 'Test Label');
      expect(inputs).toHaveProperty('className');
      expect(inputs).toHaveProperty('tabIndex', 1);
      expect(inputs).toHaveProperty('props', { hint: 'Test hint' });
      // type should NOT be included
      expect(inputs).not.toHaveProperty('type');
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
      const inputs = buildBaseInputs(fieldDef);

      // Assert - key + label
      expect(Object.keys(inputs)).toHaveLength(2);
      expect(inputs).toHaveProperty('key', 'testField');
      expect(inputs).toHaveProperty('label', 'Test Label');
    });

    it('should NOT pass through custom properties (inclusion-based)', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
        customProp: 'custom value',
        anotherProp: 123,
      } as any;

      // Act
      const inputs = buildBaseInputs(fieldDef);

      // Assert - custom properties should NOT be included (only key + label)
      expect(Object.keys(inputs)).toHaveLength(2);
      expect(inputs).toHaveProperty('key');
      expect(inputs).toHaveProperty('label');
      expect(inputs).not.toHaveProperty('customProp');
      expect(inputs).not.toHaveProperty('anotherProp');
    });

    it('should NOT include disabled, readonly, hidden, or validation properties', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        disabled: true,
        readonly: false,
        hidden: false,
        label: 'Test Label',
        validation: { required: true },
        conditionals: {},
      } as any;

      // Act
      const inputs = buildBaseInputs(fieldDef);

      // Assert - only key + label
      expect(Object.keys(inputs)).toHaveLength(2);
      expect(inputs).toHaveProperty('key');
      expect(inputs).toHaveProperty('label');
      expect(inputs).not.toHaveProperty('disabled');
      expect(inputs).not.toHaveProperty('readonly');
      expect(inputs).not.toHaveProperty('hidden');
      expect(inputs).not.toHaveProperty('validation');
      expect(inputs).not.toHaveProperty('conditionals');
    });
  });

  describe('baseFieldMapper signal wrapper', () => {
    it('should return a signal containing the inputs', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Field',
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal();

      // Assert
      expect(typeof inputsSignal).toBe('function'); // It's a signal
      expect(inputs).toHaveProperty('key', 'testField');
      expect(inputs).toHaveProperty('label', 'Test Field');
    });

    it('should handle field definition with minimal properties', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal();

      // Assert - only key is mapped (always included)
      expect(Object.keys(inputs)).toHaveLength(1);
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
      const inputs = inputsSignal();

      // Assert - only key is mapped
      expect(Object.keys(inputs)).toHaveLength(1);
      expect(inputs).toHaveProperty('key', 'testField');
    });
  });

  describe('className with grid classes', () => {
    it('should merge grid classes with user className', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        className: 'user-class',
        col: 6,
      };

      // Act
      const inputs = buildBaseInputs(fieldDef);

      // Assert - className should include both grid class and user class
      expect(inputs).toHaveProperty('className');
      expect(inputs['className']).toContain('user-class');
      // Grid class format depends on getGridClassString implementation
    });

    it('should only have grid classes when no user className provided', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        col: 12,
      };

      // Act
      const inputs = buildBaseInputs(fieldDef);

      // Assert - className should be set from grid classes
      expect(inputs).toHaveProperty('className');
    });

    it('should not set className when no col or user className', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
      };

      // Act
      const inputs = buildBaseInputs(fieldDef);

      // Assert - no className when neither is provided (only key)
      expect(inputs).not.toHaveProperty('className');
      expect(inputs).toHaveProperty('key');
    });
  });

  describe('integration scenarios', () => {
    it('should create correct inputs for complex field definition', () => {
      // Arrange
      const complexFieldDef: FieldDef<any> = {
        key: 'complexField',
        type: 'input',
        label: 'Complex Field',
        className: 'complex-class',
        tabIndex: 5,
        props: { placeholder: 'Enter value', hint: 'This is a hint' },
        // These should NOT be included (inclusion-based)
        customAttribute: 'custom-value',
        anotherCustomProp: 42,
        // These are explicitly excluded
        disabled: true,
        readonly: false,
        hidden: false,
        validation: { required: true },
        conditionals: { show: true },
      } as any;

      // Act
      const inputsSignal = baseFieldMapper(complexFieldDef);
      const inputs = inputsSignal();

      // Assert - key + label + className + tabIndex + props
      expect(Object.keys(inputs)).toHaveLength(5);
      expect(inputs).toHaveProperty('key', 'complexField');
      expect(inputs).toHaveProperty('label', 'Complex Field');
      expect(inputs).toHaveProperty('className');
      expect(inputs).toHaveProperty('tabIndex', 5);
      expect(inputs).toHaveProperty('props');
      // Custom props should NOT be included
      expect(inputs).not.toHaveProperty('customAttribute');
      expect(inputs).not.toHaveProperty('anotherCustomProp');
    });

    it('should verify only base properties are mapped', () => {
      // Arrange
      const fieldDef: FieldDef<any> = {
        key: 'testField',
        type: 'input',
        label: 'Test Field',
        className: 'test-class',
      };

      // Act
      const inputsSignal = baseFieldMapper(fieldDef);
      const inputs = inputsSignal();

      // Assert
      expect(inputs).toHaveProperty('key', 'testField');
      expect(inputs).toHaveProperty('label', 'Test Field');
      expect(inputs).toHaveProperty('className');
      expect(inputs).not.toHaveProperty('type');
    });
  });
});
