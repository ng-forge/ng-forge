import { TestBed } from '@angular/core/testing';
import { baseFieldMapper, buildBaseInputs } from './base-field-mapper';
import { FieldDef } from '../../definitions/base/field-def';

describe('baseFieldMapper', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
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

  describe('defaultProps merging', () => {
    it('should use defaultProps when field has no props', () => {
      // Arrange
      const fieldDef: FieldDef<unknown> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
      };
      const defaultProps = { appearance: 'outline', size: 'small' };

      // Act
      const inputs = buildBaseInputs(fieldDef, defaultProps);

      // Assert
      expect(inputs).toHaveProperty('props', { appearance: 'outline', size: 'small' });
    });

    it('should merge defaultProps with field props (field takes precedence)', () => {
      // Arrange
      const fieldDef: FieldDef<unknown> = {
        key: 'testField',
        type: 'input',
        label: 'Test Label',
        props: { appearance: 'fill', hint: 'Field hint' },
      };
      const defaultProps = { appearance: 'outline', size: 'small' };

      // Act
      const inputs = buildBaseInputs(fieldDef, defaultProps);

      // Assert - field props override defaultProps
      expect(inputs['props']).toEqual({
        appearance: 'fill', // overridden by field
        size: 'small', // from defaultProps
        hint: 'Field hint', // only in field
      });
    });

    it('should handle undefined defaultProps gracefully', () => {
      // Arrange
      const fieldDef: FieldDef<unknown> = {
        key: 'testField',
        type: 'input',
        props: { hint: 'Test hint' },
      };

      // Act
      const inputs = buildBaseInputs(fieldDef, undefined);

      // Assert
      expect(inputs['props']).toEqual({ hint: 'Test hint' });
    });

    it('should handle empty defaultProps object', () => {
      // Arrange
      const fieldDef: FieldDef<unknown> = {
        key: 'testField',
        type: 'input',
        props: { hint: 'Test hint' },
      };

      // Act
      const inputs = buildBaseInputs(fieldDef, {});

      // Assert
      expect(inputs['props']).toEqual({ hint: 'Test hint' });
    });

    it('should not set props when both defaultProps and field props are undefined', () => {
      // Arrange
      const fieldDef: FieldDef<unknown> = {
        key: 'testField',
        type: 'input',
      };

      // Act
      const inputs = buildBaseInputs(fieldDef, undefined);

      // Assert
      expect(inputs).not.toHaveProperty('props');
    });

    it('should set props from defaultProps even when field props is undefined', () => {
      // Arrange
      const fieldDef: FieldDef<unknown> = {
        key: 'testField',
        type: 'input',
      };
      const defaultProps = { appearance: 'outline' };

      // Act
      const inputs = buildBaseInputs(fieldDef);
      const inputsWithDefaults = buildBaseInputs(fieldDef, defaultProps);

      // Assert
      expect(inputs).not.toHaveProperty('props');
      expect(inputsWithDefaults).toHaveProperty('props', { appearance: 'outline' });
    });

    it('should handle deeply nested props correctly', () => {
      // Arrange - note: shallow merge, nested objects replace entirely
      const fieldDef: FieldDef<unknown> = {
        key: 'testField',
        type: 'input',
        props: { nested: { fieldValue: true } },
      };
      const defaultProps = { nested: { defaultValue: true }, other: 'value' };

      // Act
      const inputs = buildBaseInputs(fieldDef, defaultProps);

      // Assert - shallow merge: field's nested replaces default's nested entirely
      expect(inputs['props']).toEqual({
        nested: { fieldValue: true }, // field value wins entirely (shallow merge)
        other: 'value', // from defaultProps
      });
    });

    it('should handle Material-like props scenario', () => {
      // Arrange
      const fieldDef: FieldDef<unknown> = {
        key: 'email',
        type: 'mat-input',
        label: 'Email',
        props: { appearance: 'fill' }, // Override just appearance
      };
      const defaultProps = {
        appearance: 'outline',
        subscriptSizing: 'dynamic',
        disableRipple: false,
      };

      // Act
      const inputs = buildBaseInputs(fieldDef, defaultProps);

      // Assert
      expect(inputs['props']).toEqual({
        appearance: 'fill', // overridden
        subscriptSizing: 'dynamic', // from defaults
        disableRipple: false, // from defaults
      });
    });

    it('should handle Bootstrap-like props scenario', () => {
      // Arrange
      const fieldDef: FieldDef<unknown> = {
        key: 'username',
        type: 'bs-input',
        label: 'Username',
        // No field props - should use all defaults
      };
      const defaultProps = {
        size: 'sm',
        floatingLabel: true,
        variant: 'primary',
      };

      // Act
      const inputs = buildBaseInputs(fieldDef, defaultProps);

      // Assert
      expect(inputs['props']).toEqual({
        size: 'sm',
        floatingLabel: true,
        variant: 'primary',
      });
    });

    it('should handle Ionic-like props scenario', () => {
      // Arrange
      const fieldDef: FieldDef<unknown> = {
        key: 'phone',
        type: 'ionic-input',
        label: 'Phone',
        props: { color: 'secondary' }, // Override color
      };
      const defaultProps = {
        fill: 'outline',
        labelPlacement: 'floating',
        color: 'primary',
      };

      // Act
      const inputs = buildBaseInputs(fieldDef, defaultProps);

      // Assert
      expect(inputs['props']).toEqual({
        fill: 'outline',
        labelPlacement: 'floating',
        color: 'secondary', // overridden
      });
    });

    it('should handle PrimeNG-like props scenario', () => {
      // Arrange
      const fieldDef: FieldDef<unknown> = {
        key: 'description',
        type: 'prime-textarea',
        label: 'Description',
        props: { variant: 'filled' },
      };
      const defaultProps = {
        size: 'small',
        variant: 'outlined',
      };

      // Act
      const inputs = buildBaseInputs(fieldDef, defaultProps);

      // Assert
      expect(inputs['props']).toEqual({
        size: 'small', // from defaults
        variant: 'filled', // overridden
      });
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
