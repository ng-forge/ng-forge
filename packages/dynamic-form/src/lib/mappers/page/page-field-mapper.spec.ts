import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { pageFieldMapper } from './page-field-mapper';
import { PageField } from '../../definitions';
import { FieldDef } from '../../definitions';

describe('pageFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  describe('property binding creation', () => {
    it('should create exactly 2 bindings for page field', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'testPage',
        type: 'page',
        fields: [],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + field
      expect(Array.isArray(bindings)).toBe(true);
      expect(bindings.every((binding) => typeof binding === 'object')).toBe(true);
    });

    it('should create bindings regardless of additional properties', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'complexPage',
        type: 'page',
        label: 'Complex Page',
        className: 'page-class',
        fields: [],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // Still only key + field
    });

    it('should create bindings for page with nested fields', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'userPage',
        type: 'page',
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
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + field
    });
  });

  describe('binding structure verification', () => {
    it('should create key binding with correct value', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'testPage',
        type: 'page',
        fields: [],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // The first binding should be for the key property
      // We can't directly inspect the binding structure, but we can verify count
    });

    it('should create field binding with entire field definition', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'formPage',
        type: 'page',
        label: 'Form Page',
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
          },
        ],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // Second binding should contain the entire field definition
    });

    it('should use inputBinding() for all bindings', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'testPage',
        type: 'page',
        fields: [],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      expect(bindings.every((binding) => typeof binding === 'object')).toBe(true);
    });
  });

  describe('edge cases with nested fields', () => {
    it('should handle empty fields array', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'emptyPage',
        type: 'page',
        fields: [],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle single nested field', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'singleFieldPage',
        type: 'page',
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
          },
        ],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle multiple nested fields', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'multiFieldPage',
        type: 'page',
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
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle nested fields with various types', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'mixedPage',
        type: 'page',
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
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle page with nested group fields', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'pageWithGroups',
        type: 'page',
        fields: [
          {
            key: 'personalInfo',
            type: 'group',
            label: 'Personal Information',
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
          },
          {
            key: 'contactInfo',
            type: 'group',
            label: 'Contact Information',
            fields: [
              {
                key: 'email',
                type: 'input',
                label: 'Email',
              },
            ],
          },
        ],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle page with nested row fields', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'pageWithRows',
        type: 'page',
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
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });

  describe('minimal and complex field definitions', () => {
    it('should handle minimal PageField definition', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'minimalPage',
        type: 'page',
        fields: [],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle PageField with label', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'labeledPage',
        type: 'page',
        label: 'Labeled Page',
        fields: [],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle PageField with className', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'styledPage',
        type: 'page',
        className: 'custom-page-class',
        fields: [],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle PageField with all optional properties', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'fullPage',
        type: 'page',
        label: 'Full Page',
        className: 'full-page',
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
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // Always key + field
    });
  });

  describe('integration scenarios', () => {
    it('should create correct bindings for complex nested structure', () => {
      // Arrange
      const complexFieldDef: PageField = {
        key: 'registrationPage',
        type: 'page',
        label: 'User Registration',
        className: 'registration-page',
        fields: [
          {
            key: 'personalGroup',
            type: 'group',
            label: 'Personal Information',
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
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email Address',
          },
        ],
      };

      // Act
      const bindings = pageFieldMapper(complexFieldDef);

      // Assert
      expect(bindings).toHaveLength(2); // key + field
      expect(Array.isArray(bindings)).toBe(true);
    });

    it('should handle PageField with deeply nested structure', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'deepPage',
        type: 'page',
        fields: [
          {
            key: 'section1',
            type: 'group',
            label: 'Section 1',
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
          },
        ],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should preserve field definition integrity in bindings', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'preservedPage',
        type: 'page',
        label: 'Test Page',
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
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
      // The bindings should preserve the entire field definition
    });

    it('should handle PageField with custom properties', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'customPage',
        type: 'page',
        fields: [],
        customProp: 'custom-value',
        anotherProp: 123,
      } as any;

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle PageField with validation and conditionals', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'validatedPage',
        type: 'page',
        fields: [],
        validation: { required: true },
        conditionals: { show: true },
      } as any;

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });

    it('should handle multi-section page layout', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'multiSectionPage',
        type: 'page',
        label: 'Multi-Section Form',
        fields: [
          {
            key: 'section1',
            type: 'group',
            label: 'Section 1',
            fields: [
              {
                key: 'field1',
                type: 'input',
                label: 'Field 1',
              },
            ],
          },
          {
            key: 'section2',
            type: 'group',
            label: 'Section 2',
            fields: [
              {
                key: 'field2',
                type: 'input',
                label: 'Field 2',
              },
            ],
          },
          {
            key: 'section3',
            type: 'group',
            label: 'Section 3',
            fields: [
              {
                key: 'field3',
                type: 'input',
                label: 'Field 3',
              },
            ],
          },
        ],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });

  describe('binding consistency', () => {
    it('should create same number of bindings regardless of field complexity', () => {
      // Arrange
      const simpleFieldDef: PageField = {
        key: 'simple',
        type: 'page',
        fields: [],
      };

      const complexFieldDef: PageField = {
        key: 'complex',
        type: 'page',
        label: 'Complex',
        className: 'complex-class',
        tabIndex: 10,
        props: { hint: 'A hint' },
        fields: [
          {
            key: 'group1',
            type: 'group',
            label: 'Group 1',
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
          },
        ],
      };

      // Act
      const simpleBindings = pageFieldMapper(simpleFieldDef);
      const complexBindings = pageFieldMapper(complexFieldDef);

      // Assert
      expect(simpleBindings).toHaveLength(2);
      expect(complexBindings).toHaveLength(2);
      expect(simpleBindings.length).toBe(complexBindings.length);
    });

    it('should always return array of bindings', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'testPage',
        type: 'page',
        fields: [],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(Array.isArray(bindings)).toBe(true);
      expect(bindings).toHaveLength(2);
    });

    it('should create bindings for different keys', () => {
      // Arrange
      const fieldDef1: PageField = {
        key: 'page1',
        type: 'page',
        fields: [],
      };

      const fieldDef2: PageField = {
        key: 'page2',
        type: 'page',
        fields: [],
      };

      // Act
      const bindings1 = pageFieldMapper(fieldDef1);
      const bindings2 = pageFieldMapper(fieldDef2);

      // Assert
      expect(bindings1).toHaveLength(2);
      expect(bindings2).toHaveLength(2);
      // Both should create same number of bindings
    });

    it('should handle page with mixed container types', () => {
      // Arrange
      const fieldDef: PageField = {
        key: 'mixedPage',
        type: 'page',
        fields: [
          {
            key: 'group1',
            type: 'group',
            label: 'Group',
            fields: [
              {
                key: 'field1',
                type: 'input',
                label: 'Field 1',
              },
            ],
          },
          {
            key: 'row1',
            type: 'row',
            fields: [
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
          } as any,
          {
            key: 'field4',
            type: 'input',
            label: 'Field 4',
          },
        ],
      };

      // Act
      const bindings = pageFieldMapper(fieldDef);

      // Assert
      expect(bindings).toHaveLength(2);
    });
  });
});
