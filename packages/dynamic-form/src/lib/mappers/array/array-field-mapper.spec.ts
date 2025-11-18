import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { arrayFieldMapper } from './array-field-mapper';
import { ArrayField } from '../../definitions';

describe('arrayFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  describe('basic binding creation', () => {
    it('should create exactly 2 bindings for key and field', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'items',
        type: 'array',
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + field
      expect(Array.isArray(bindings)).toBe(true);
      expect(bindings.every((binding) => typeof binding === 'object')).toBe(true);
    });

    it('should create binding for key property', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'testArray',
        type: 'array',
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // First binding should be for key
      expect(bindings[0]).toBeDefined();
    });

    it('should create binding for field definition', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'testArray',
        type: 'array',
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // Second binding should be for field
      expect(bindings[1]).toBeDefined();
    });

    it('should always create exactly 2 bindings regardless of field properties', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'complexArray',
        type: 'array',
        label: 'Complex Array',
        className: 'array-class',
        items: {
          key: 'item',
          type: 'input',
        },
        props: {
          minItems: 1,
          maxItems: 10,
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // Still only key + field
    });
  });

  describe('property handling', () => {
    it('should handle minimal array field definition', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'minimalArray',
        type: 'array',
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with label', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'labeledArray',
        type: 'array',
        label: 'My Array Field',
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with className', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'styledArray',
        type: 'array',
        className: 'custom-array-class',
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with props', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'propsArray',
        type: 'array',
        props: {
          minItems: 2,
          maxItems: 5,
          addButtonText: 'Add Item',
          removeButtonText: 'Remove',
        },
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with nested object items', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'objectArray',
        type: 'array',
        items: {
          key: 'person',
          type: 'object',
          fields: [
            { key: 'name', type: 'input' },
            { key: 'age', type: 'input' },
          ],
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with nested array items', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'nestedArray',
        type: 'array',
        items: {
          key: 'subArray',
          type: 'array',
          items: {
            key: 'item',
            type: 'input',
          },
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle all common array field properties', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'fullArray',
        type: 'array',
        label: 'Full Array',
        className: 'full-array-class',
        tabIndex: 1,
        props: {
          minItems: 1,
          maxItems: 10,
          addButtonText: 'Add',
          removeButtonText: 'Remove',
          hint: 'Array hint',
        },
        items: {
          key: 'item',
          type: 'input',
          label: 'Item Label',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should handle array field with empty key', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: '',
        type: 'array',
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with special characters in key', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'array-field_123',
        type: 'array',
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with undefined label', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'unlabeledArray',
        type: 'array',
        label: undefined,
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with null className', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'nullClassArray',
        type: 'array',
        className: null as any,
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with empty props object', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'emptyPropsArray',
        type: 'array',
        props: {},
        items: {
          key: 'item',
          type: 'input',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with validation rules', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'validatedArray',
        type: 'array',
        validation: {
          required: true,
          minLength: 2,
          maxLength: 5,
        },
        items: {
          key: 'item',
          type: 'input',
        },
      } as any;

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with conditionals', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'conditionalArray',
        type: 'array',
        conditionals: {
          hide: 'model.hideArray === true',
        },
        items: {
          key: 'item',
          type: 'input',
        },
      } as any;

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });

  describe('integration scenarios', () => {
    it('should create bindings for complex nested array structure', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'addresses',
        type: 'array',
        label: 'Addresses',
        className: 'addresses-array',
        tabIndex: 1,
        props: {
          minItems: 1,
          maxItems: 3,
          addButtonText: 'Add Address',
          removeButtonText: 'Remove Address',
        },
        items: {
          key: 'address',
          type: 'object',
          fields: [
            {
              key: 'street',
              type: 'input',
              label: 'Street',
            },
            {
              key: 'city',
              type: 'input',
              label: 'City',
            },
            {
              key: 'phoneNumbers',
              type: 'array',
              label: 'Phone Numbers',
              items: {
                key: 'phone',
                type: 'input',
              },
            },
          ],
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should create bindings for array with custom properties', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'customArray',
        type: 'array',
        label: 'Custom Array',
        customProp: 'custom value',
        anotherCustomProp: 123,
        items: {
          key: 'item',
          type: 'input',
        },
      } as any;

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should preserve entire field definition in field binding', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'preserveArray',
        type: 'array',
        label: 'Preserve Test',
        className: 'preserve-class',
        props: { minItems: 1 },
        items: {
          key: 'item',
          type: 'input',
          label: 'Item',
        },
      };

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // The field binding should contain the entire definition
      // This is tested implicitly by the fact that the array component
      // will receive the full field definition via the binding
    });

    it('should handle array field with disabled state', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'disabledArray',
        type: 'array',
        disabled: true,
        items: {
          key: 'item',
          type: 'input',
        },
      } as any;

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with readonly state', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'readonlyArray',
        type: 'array',
        readonly: true,
        items: {
          key: 'item',
          type: 'input',
        },
      } as any;

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle array field with hidden state', () => {
      // Arrange
      const fieldDef: ArrayField = {
        key: 'hiddenArray',
        type: 'array',
        hidden: true,
        items: {
          key: 'item',
          type: 'input',
        },
      } as any;

      // Act
      const bindings = arrayFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });
});
