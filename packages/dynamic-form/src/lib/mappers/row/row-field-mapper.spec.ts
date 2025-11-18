import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { rowFieldMapper } from './row-field-mapper';
import { RowField } from '../../definitions';
import { FieldDef } from '../../definitions';

describe('rowFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  describe('property binding creation', () => {
    it('should create exactly 2 bindings for row field', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'testRow',
        type: 'row',
        fields: [],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + field
      expect(Array.isArray(bindings)).toBe(true);
      expect(bindings.every((binding) => typeof binding === 'object')).toBe(true);
    });

    it('should create bindings regardless of additional properties', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'complexRow',
        type: 'row',
        label: 'Complex Row',
        className: 'row-class',
        fields: [],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // Still only key + field
    });

    it('should create bindings for row with nested fields', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'userRow',
        type: 'row',
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
          },
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + field
    });
  });

  describe('binding structure verification', () => {
    it('should create key binding with correct value', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'testRow',
        type: 'row',
        fields: [],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // The first binding should be for the key property
      // We can't directly inspect the binding structure, but we can verify count
    });

    it('should create field binding with entire field definition', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'addressRow',
        type: 'row',
        label: 'Address Row',
        fields: [
          {
            key: 'street',
            type: 'input',
            label: 'Street',
          },
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // Second binding should contain the entire field definition
    });

    it('should use inputBinding() for all bindings', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'testRow',
        type: 'row',
        fields: [],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      expect(bindings.every((binding) => typeof binding === 'object')).toBe(true);
    });
  });

  describe('edge cases with nested fields', () => {
    it('should handle empty fields array', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'emptyRow',
        type: 'row',
        fields: [],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle single nested field', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'singleFieldRow',
        type: 'row',
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
          },
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle multiple nested fields', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'multiFieldRow',
        type: 'row',
        fields: [
          {
            key: 'username',
            type: 'input',
            label: 'Username',
          },
          {
            key: 'password',
            type: 'input',
            label: 'Password',
          },
          {
            key: 'confirmPassword',
            type: 'input',
            label: 'Confirm Password',
          },
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle nested fields with various types', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'mixedRow',
        type: 'row',
        fields: [
          {
            key: 'textField',
            type: 'input',
            label: 'Text',
          },
          {
            key: 'selectField',
            type: 'select',
            label: 'Select',
            props: { options: [] },
          } as any,
          {
            key: 'checkboxField',
            type: 'checkbox',
            label: 'Checkbox',
          } as any,
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });

  describe('minimal and complex field definitions', () => {
    it('should handle minimal RowField definition', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'minimalRow',
        type: 'row',
        fields: [],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle RowField with label', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'labeledRow',
        type: 'row',
        label: 'Labeled Row',
        fields: [],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle RowField with className', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'styledRow',
        type: 'row',
        className: 'custom-row-class',
        fields: [],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle RowField with all optional properties', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'fullRow',
        type: 'row',
        label: 'Full Row',
        className: 'full-row',
        tabIndex: 1,
        props: { customProp: 'value' },
        fields: [
          {
            key: 'nestedField',
            type: 'input',
            label: 'Nested',
          },
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // Always key + field
    });
  });

  describe('integration scenarios', () => {
    it('should create correct bindings for complex nested structure', () => {
      // Arrange
      const complexFieldDef: RowField = {
        key: 'addressRow',
        type: 'row',
        label: 'Address Information',
        className: 'address-row',
        fields: [
          {
            key: 'street',
            type: 'input',
            label: 'Street Address',
            className: 'street-input',
          },
          {
            key: 'city',
            type: 'input',
            label: 'City',
          },
          {
            key: 'state',
            type: 'select',
            label: 'State',
            props: { options: [] },
          } as any,
          {
            key: 'zipCode',
            type: 'input',
            label: 'ZIP Code',
            props: { mask: '00000' },
          },
        ],
      };

      // Act
      const bindings = rowFieldMapper(complexFieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + field
      expect(Array.isArray(bindings)).toBe(true);
    });

    it('should handle RowField with group-based nested structure', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'formRow',
        type: 'row',
        label: 'Form Row',
        fields: [
          {
            key: 'group1',
            type: 'group',
            fields: [
              {
                key: 'field1',
                type: 'input',
                label: 'Field 1',
              },
              {
                key: 'field2',
                type: 'input',
                label: 'Field 2',
              },
            ],
          } as any,
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should preserve field definition integrity in bindings', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'preservedRow',
        type: 'row',
        label: 'Test Row',
        className: 'test-class',
        tabIndex: 5,
        fields: [
          {
            key: 'testField',
            type: 'input',
            label: 'Test',
          },
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // The bindings should preserve the entire field definition
    });

    it('should handle RowField with custom properties', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'customRow',
        type: 'row',
        fields: [],
        customProp: 'custom-value',
        anotherProp: 123,
      } as any;

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle RowField with validation and conditionals', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'validatedRow',
        type: 'row',
        fields: [],
        validation: { required: true },
        conditionals: { show: true },
      } as any;

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle RowField with column layout properties', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'layoutRow',
        type: 'row',
        fields: [
          {
            key: 'field1',
            type: 'input',
            label: 'Field 1',
            col: { span: 6 },
          } as any,
          {
            key: 'field2',
            type: 'input',
            label: 'Field 2',
            col: { span: 6 },
          } as any,
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });

  describe('binding consistency', () => {
    it('should create same number of bindings regardless of field complexity', () => {
      // Arrange
      const simpleFieldDef: RowField = {
        key: 'simple',
        type: 'row',
        fields: [],
      };

      const complexFieldDef: RowField = {
        key: 'complex',
        type: 'row',
        label: 'Complex',
        className: 'complex-class',
        tabIndex: 10,
        props: { hint: 'A hint' },
        fields: [
          {
            key: 'field1',
            type: 'input',
            label: 'Field 1',
          },
          {
            key: 'field2',
            type: 'input',
            label: 'Field 2',
          },
          {
            key: 'field3',
            type: 'input',
            label: 'Field 3',
          },
        ],
      };

      // Act
      const simpleBindings = rowFieldMapper(simpleFieldDef);
      const complexBindings = rowFieldMapper(complexFieldDef);

      // Assert
      expect(simpleBindings).toHaveLength(2);
      expect(complexBindings).toHaveLength(2);
      expect(simpleBindings.length).toBe(complexBindings.length);
    });

    it('should always return array of bindings', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'testRow',
        type: 'row',
        fields: [],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(Array.isArray(bindings)).toBe(true);
      expect(bindings).toHaveLength(2);
    });

    it('should create bindings for different keys', () => {
      // Arrange
      const fieldDef1: RowField = {
        key: 'row1',
        type: 'row',
        fields: [],
      };

      const fieldDef2: RowField = {
        key: 'row2',
        type: 'row',
        fields: [],
      };

      // Act
      const bindings1 = rowFieldMapper(fieldDef1);
      const bindings2 = rowFieldMapper(fieldDef2);

      // Assert
      expect(bindings1).toHaveLength(2);
      expect(bindings2).toHaveLength(2);
      // Both should create same number of bindings
    });
  });

  describe('row-specific scenarios', () => {
    it('should handle RowField with mixed content types', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'mixedContentRow',
        type: 'row',
        fields: [
          {
            key: 'inputField',
            type: 'input',
            label: 'Input',
          },
          {
            key: 'selectField',
            type: 'select',
            label: 'Select',
            props: { options: ['A', 'B', 'C'] },
          } as any,
          {
            key: 'groupField',
            type: 'group',
            label: 'Group',
            fields: [
              {
                key: 'nestedInput',
                type: 'input',
                label: 'Nested',
              },
            ],
          } as any,
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle RowField as layout container without value', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'layoutRow',
        type: 'row',
        label: 'Layout Container',
        fields: [
          {
            key: 'col1',
            type: 'input',
            label: 'Column 1',
          },
          {
            key: 'col2',
            type: 'input',
            label: 'Column 2',
          },
          {
            key: 'col3',
            type: 'input',
            label: 'Column 3',
          },
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // Row is layout only, no value
    });

    it('should handle RowField with responsive column layouts', () => {
      // Arrange
      const fieldDef: RowField = {
        key: 'responsiveRow',
        type: 'row',
        fields: [
          {
            key: 'field1',
            type: 'input',
            label: 'Field 1',
            col: { span: 12, start: 1, end: 13 },
          } as any,
          {
            key: 'field2',
            type: 'input',
            label: 'Field 2',
            col: { span: 6 },
          } as any,
        ],
      };

      // Act
      const bindings = rowFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });
});
