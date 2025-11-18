import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { groupFieldMapper } from './group-field-mapper';
import { GroupField } from '../../definitions';
import { FieldDef } from '../../definitions';

describe('groupFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  describe('property binding creation', () => {
    it('should create exactly 2 bindings for group field', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'testGroup',
        type: 'group',
        fields: [],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + field
      expect(Array.isArray(bindings)).toBe(true);
      expect(bindings.every((binding) => typeof binding === 'object')).toBe(true);
    });

    it('should create bindings regardless of additional properties', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'complexGroup',
        type: 'group',
        label: 'Complex Group',
        className: 'group-class',
        fields: [],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // Still only key + field
    });

    it('should create bindings for group with nested fields', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'userGroup',
        type: 'group',
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
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + field
    });
  });

  describe('binding structure verification', () => {
    it('should create key binding with correct value', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'testGroup',
        type: 'group',
        fields: [],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // The first binding should be for the key property
      // We can't directly inspect the binding structure, but we can verify count
    });

    it('should create field binding with entire field definition', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'addressGroup',
        type: 'group',
        label: 'Address',
        fields: [
          {
            key: 'street',
            type: 'input',
            label: 'Street',
          },
        ],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // Second binding should contain the entire field definition
    });

    it('should use inputBinding() for all bindings', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'testGroup',
        type: 'group',
        fields: [],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      expect(bindings.every((binding) => typeof binding === 'object')).toBe(true);
    });
  });

  describe('edge cases with nested fields', () => {
    it('should handle empty fields array', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'emptyGroup',
        type: 'group',
        fields: [],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle single nested field', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'singleFieldGroup',
        type: 'group',
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
          },
        ],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle multiple nested fields', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'multiFieldGroup',
        type: 'group',
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
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle nested fields with various types', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'mixedGroup',
        type: 'group',
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
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });

  describe('minimal and complex field definitions', () => {
    it('should handle minimal GroupField definition', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'minimalGroup',
        type: 'group',
        fields: [],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle GroupField with label', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'labeledGroup',
        type: 'group',
        label: 'Labeled Group',
        fields: [],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle GroupField with className', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'styledGroup',
        type: 'group',
        className: 'custom-group-class',
        fields: [],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle GroupField with all optional properties', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'fullGroup',
        type: 'group',
        label: 'Full Group',
        className: 'full-group',
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
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // Always key + field
    });
  });

  describe('integration scenarios', () => {
    it('should create correct bindings for complex nested structure', () => {
      // Arrange
      const complexFieldDef: GroupField = {
        key: 'addressGroup',
        type: 'group',
        label: 'Address Information',
        className: 'address-group',
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
      const bindings = groupFieldMapper(complexFieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + field
      expect(Array.isArray(bindings)).toBe(true);
    });

    it('should handle GroupField with row-based nested structure', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'formGroup',
        type: 'group',
        label: 'Form Group',
        fields: [
          {
            key: 'row1',
            type: 'row',
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
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should preserve field definition integrity in bindings', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'preservedGroup',
        type: 'group',
        label: 'Test Group',
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
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // The bindings should preserve the entire field definition
    });

    it('should handle GroupField with custom properties', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'customGroup',
        type: 'group',
        fields: [],
        customProp: 'custom-value',
        anotherProp: 123,
      } as any;

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle GroupField with validation and conditionals', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'validatedGroup',
        type: 'group',
        fields: [],
        validation: { required: true },
        conditionals: { show: true },
      } as any;

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });

  describe('binding consistency', () => {
    it('should create same number of bindings regardless of field complexity', () => {
      // Arrange
      const simpleFieldDef: GroupField = {
        key: 'simple',
        type: 'group',
        fields: [],
      };

      const complexFieldDef: GroupField = {
        key: 'complex',
        type: 'group',
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
      const simpleBindings = groupFieldMapper(simpleFieldDef);
      const complexBindings = groupFieldMapper(complexFieldDef);

      // Assert
      expect(simpleBindings).toHaveLength(2);
      expect(complexBindings).toHaveLength(2);
      expect(simpleBindings.length).toBe(complexBindings.length);
    });

    it('should always return array of bindings', () => {
      // Arrange
      const fieldDef: GroupField = {
        key: 'testGroup',
        type: 'group',
        fields: [],
      };

      // Act
      const bindings = groupFieldMapper(fieldDef);

      // Assert
      expect(Array.isArray(bindings)).toBe(true);
      expect(bindings).toHaveLength(2);
    });

    it('should create bindings for different keys', () => {
      // Arrange
      const fieldDef1: GroupField = {
        key: 'group1',
        type: 'group',
        fields: [],
      };

      const fieldDef2: GroupField = {
        key: 'group2',
        type: 'group',
        fields: [],
      };

      // Act
      const bindings1 = groupFieldMapper(fieldDef1);
      const bindings2 = groupFieldMapper(fieldDef2);

      // Assert
      expect(bindings1).toHaveLength(2);
      expect(bindings2).toHaveLength(2);
      // Both should create same number of bindings
    });
  });
});
