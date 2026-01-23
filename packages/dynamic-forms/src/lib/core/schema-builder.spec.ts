import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext } from '@angular/core';
import { createSchemaFromFields, fieldsToDefaultValues, CreateSchemaOptions } from './schema-builder';
import { FieldTypeDefinition } from '../models/field-type';
import { FieldDef } from '../definitions';
import { FunctionRegistryService } from './registry/function-registry.service';
import type { StandardSchemaV1 } from '@standard-schema/spec';

// Use vi.hoisted() to declare mocks before vi.mock() hoisting
const { mockMapFieldToForm } = vi.hoisted(() => ({
  mockMapFieldToForm: vi.fn(),
}));

// Mock the mapFieldToForm function
vi.mock('./form-mapping', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./form-mapping')>();
  return {
    ...actual,
    mapFieldToForm: mockMapFieldToForm,
  };
});

describe('schema-builder', () => {
  let registry: Map<string, FieldTypeDefinition>;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FunctionRegistryService],
    });

    injector = TestBed.inject(Injector);
    registry = new Map<string, FieldTypeDefinition>();
    mockMapFieldToForm.mockClear();

    // Register common field types
    registry.set('input', {
      name: 'input',
      mapper: () => [],
      valueHandling: 'include',
    });

    registry.set('checkbox', {
      name: 'checkbox',
      mapper: () => [],
      valueHandling: 'include',
    });

    registry.set('select', {
      name: 'select',
      mapper: () => [],
      valueHandling: 'include',
    });

    registry.set('text', {
      name: 'text',
      mapper: () => [],
      valueHandling: 'exclude',
    });

    registry.set('button', {
      name: 'button',
      mapper: () => [],
      valueHandling: 'exclude',
    });

    registry.set('page', {
      name: 'page',
      mapper: () => [],
      valueHandling: 'flatten',
    });

    registry.set('row', {
      name: 'row',
      mapper: () => [],
      valueHandling: 'flatten',
    });

    registry.set('group', {
      name: 'group',
      mapper: () => [],
      valueHandling: 'include',
    });

    registry.set('array', {
      name: 'array',
      mapper: () => [],
      valueHandling: 'include',
    });
  });

  // Test Suite 1.1: createSchemaFromFields()
  describe('createSchemaFromFields()', () => {
    // Helper to run schema creation in injection context
    function createSchema<TModel = unknown>(fields: FieldDef<any>[], reg: Map<string, FieldTypeDefinition>) {
      return runInInjectionContext(injector, () => createSchemaFromFields<TModel>(fields, reg));
    }

    // 1.1.1 Basic Field Processing
    describe('Basic Field Processing', () => {
      it('should create schema from empty fields array', () => {
        const schema = createSchema([], registry);
        expect(schema).toBeDefined();
      });

      it('should create schema from single field with include value handling', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name' }];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should create schema from multiple fields with include value handling', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name' },
          { type: 'input', key: 'email' },
          { type: 'checkbox', key: 'subscribe' },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should skip fields without keys', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name' },
          { type: 'input' } as any, // No key
          { type: 'input', key: 'email' },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should handle fields where path is undefined/null', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'nonexistent' }];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });
    });

    // 1.1.2 Value Handling Mode: 'exclude'
    describe("Value Handling Mode: 'exclude'", () => {
      it('should skip fields with exclude value handling (text)', () => {
        const fields: FieldDef<any>[] = [
          { type: 'text', key: 'label' },
          { type: 'input', key: 'name' },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should skip fields with exclude value handling (button)', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name' },
          { type: 'button', key: 'submit' },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should not call mapFieldToForm for excluded fields', () => {
        const fields: FieldDef<any>[] = [{ type: 'text', key: 'label' }];
        createSchema(fields, registry);
        expect(mockMapFieldToForm).not.toHaveBeenCalled();
      });

      it('should process subsequent fields after excluded fields', () => {
        const fields: FieldDef<any>[] = [
          { type: 'text', key: 'label' },
          { type: 'input', key: 'name' },
          { type: 'button', key: 'submit' },
          { type: 'input', key: 'email' },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });
    });

    // 1.1.3 Value Handling Mode: 'flatten'
    describe("Value Handling Mode: 'flatten'", () => {
      it('should flatten page field children to current level (array-based)', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'page',
            key: 'page1',
            fields: [
              { type: 'input', key: 'name' },
              { type: 'input', key: 'email' },
            ],
          },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should flatten row field children to current level', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'row',
            key: 'row1',
            fields: [
              { type: 'input', key: 'firstName' },
              { type: 'input', key: 'lastName' },
            ],
          },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should handle array-based fields (page/row with fields as array)', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'page',
            key: 'page1',
            fields: [
              { type: 'input', key: 'field1' },
              { type: 'input', key: 'field2' },
            ],
          },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should handle object-based fields (group with fields as object)', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'group',
            key: 'address',
            fields: {
              street: { type: 'input', key: 'street' },
              city: { type: 'input', key: 'city' },
            },
          } as any,
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should skip flatten fields without fields property', () => {
        const fields: FieldDef<any>[] = [{ type: 'page', key: 'page1' }];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should skip flatten children without keys', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'page',
            key: 'page1',
            fields: [{ type: 'input' } as any, { type: 'input', key: 'name' }],
          },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should skip flatten children where childPath is undefined', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'page',
            key: 'page1',
            fields: [{ type: 'input', key: 'nonexistent' }],
          },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should handle mixed flatten and include fields', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'standalone' },
          {
            type: 'page',
            key: 'page1',
            fields: [{ type: 'input', key: 'pageField' }],
          },
          { type: 'checkbox', key: 'agree' },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });
    });

    // 1.1.4 Value Handling Mode: 'include' (regular fields)
    describe("Value Handling Mode: 'include' (regular fields)", () => {
      it('should process input fields with include handling', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name' }];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should process checkbox fields with include handling', () => {
        const fields: FieldDef<any>[] = [{ type: 'checkbox', key: 'agree' }];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should process select fields with include handling', () => {
        const fields: FieldDef<any>[] = [{ type: 'select', key: 'country' }];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should handle fields where fieldPath is undefined', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'nonexistent' }];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });
    });

    // 1.1.5 Complex Scenarios
    describe('Complex Scenarios', () => {
      it('should handle nested field structures (groups within pages)', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'page',
            key: 'page1',
            fields: [
              {
                type: 'group',
                key: 'personalInfo',
                fields: [
                  { type: 'input', key: 'firstName' },
                  { type: 'input', key: 'lastName' },
                ],
              },
            ],
          },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should handle mixed value handling modes in same form', () => {
        const fields: FieldDef<any>[] = [
          { type: 'text', key: 'title' }, // exclude
          {
            type: 'page',
            key: 'page1',
            fields: [
              // flatten
              { type: 'input', key: 'name' }, // include
              { type: 'button', key: 'submit' }, // exclude
            ],
          },
          { type: 'checkbox', key: 'agree' }, // include
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should preserve field order during schema creation', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'field1' },
          { type: 'input', key: 'field2' },
          { type: 'input', key: 'field3' },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should handle large number of fields', () => {
        const fields: FieldDef<any>[] = Array.from({ length: 100 }, (_, i) => ({
          type: 'input',
          key: `field${i}`,
        }));
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });
    });

    // 1.1.6 Registry Integration
    describe('Registry Integration', () => {
      it('should correctly query registry for value handling mode', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name' },
          { type: 'text', key: 'label' },
        ];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should default to include when field type not in registry', () => {
        const fields: FieldDef<any>[] = [{ type: 'unknown', key: 'field' }];
        const schema = createSchema(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should handle undefined/null registry gracefully', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name' }];
        const emptyRegistry = new Map<string, FieldTypeDefinition>();
        const schema = createSchema(fields, emptyRegistry);
        expect(schema).toBeDefined();
      });
    });

    // 1.1.7 Type Safety
    describe('Type Safety', () => {
      it('should maintain type safety with generic TModel parameter', () => {
        interface MyModel {
          name: string;
          age: number;
        }

        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name' },
          { type: 'input', key: 'age' },
        ];
        const schema = createSchema<MyModel>(fields, registry);
        expect(schema).toBeDefined();
      });

      it('should work with complex model types', () => {
        interface ComplexModel {
          user: {
            name: string;
            email: string;
          };
          settings: {
            notifications: boolean;
          };
        }

        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name' },
          { type: 'input', key: 'email' },
        ];
        const schema = createSchema<ComplexModel>(fields, registry);
        expect(schema).toBeDefined();
      });
    });

    // 1.1.8 Form-Level Schema Integration
    describe('Form-Level Schema (formLevelSchema option)', () => {
      // Helper to create a mock Standard Schema
      function createMockStandardSchema<T>(): StandardSchemaV1<T> {
        return {
          '~standard': {
            version: 1,
            vendor: 'test',
            validate: vi.fn(),
          },
        } as unknown as StandardSchemaV1<T>;
      }

      // Helper to create a StandardSchemaMarker
      function createStandardSchemaMarker<T>(schema: StandardSchemaV1<T>) {
        return {
          ɵkind: 'standardSchema' as const,
          schema,
        };
      }

      it('should create schema with formLevelSchema Standard Schema marker', () => {
        interface PasswordForm {
          password: string;
          confirmPassword: string;
        }

        const mockStandardSchema = createMockStandardSchema<PasswordForm>();
        const formLevelSchema = createStandardSchemaMarker(mockStandardSchema);

        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'password' },
          { type: 'input', key: 'confirmPassword' },
        ];

        const options: CreateSchemaOptions<PasswordForm> = {
          formLevelSchema,
        };

        const schema = runInInjectionContext(injector, () => createSchemaFromFields<PasswordForm>(fields, registry, options));

        expect(schema).toBeDefined();
      });

      it('should create schema without formLevelSchema', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name' }];

        const schema = runInInjectionContext(injector, () => createSchemaFromFields(fields, registry));

        expect(schema).toBeDefined();
      });

      it('should create schema with formLevelSchema as Angular callback', () => {
        interface LoginForm {
          email: string;
          password: string;
        }

        const angularCallback = vi.fn();
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'email' },
          { type: 'input', key: 'password' },
        ];

        const options: CreateSchemaOptions<LoginForm> = {
          formLevelSchema: angularCallback,
        };

        const schema = runInInjectionContext(injector, () => createSchemaFromFields<LoginForm>(fields, registry, options));

        expect(schema).toBeDefined();
      });

      it('should create schema with both field-level and form-level validation', () => {
        interface UserForm {
          name: string;
          email: string;
        }

        const mockStandardSchema = createMockStandardSchema<UserForm>();
        const formLevelSchema = createStandardSchemaMarker(mockStandardSchema);

        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name' },
          { type: 'input', key: 'email' },
        ];

        const options: CreateSchemaOptions<UserForm> = {
          formLevelSchema,
        };

        // Should not throw when combining field-level and form-level validation
        const schema = runInInjectionContext(injector, () => createSchemaFromFields<UserForm>(fields, registry, options));
        expect(schema).toBeDefined();
      });

      it('should create schema with empty fields array when formLevelSchema is provided', () => {
        interface EmptyForm {
          dynamicField?: string;
        }

        const mockStandardSchema = createMockStandardSchema<EmptyForm>();
        const formLevelSchema = createStandardSchemaMarker(mockStandardSchema);

        const options: CreateSchemaOptions<EmptyForm> = {
          formLevelSchema,
        };

        // Should create schema even with empty fields array
        const schema = runInInjectionContext(injector, () => createSchemaFromFields<EmptyForm>([], registry, options));
        expect(schema).toBeDefined();
      });

      it('should accept options object with both crossFieldValidators and formLevelSchema without throwing', () => {
        interface FormWithBothValidations {
          field1: string;
          field2: string;
        }

        const mockStandardSchema = createMockStandardSchema<FormWithBothValidations>();
        const formLevelSchema = createStandardSchemaMarker(mockStandardSchema);
        const crossFieldValidators = [
          {
            sourceFieldKey: 'field1',
            config: { type: 'custom' as const, expression: 'fieldValue === "test"' },
          },
        ];

        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'field1' },
          { type: 'input', key: 'field2' },
        ];

        const options: CreateSchemaOptions<FormWithBothValidations> = {
          crossFieldValidators,
          formLevelSchema,
        };

        // Should not throw when both options are provided
        expect(() =>
          runInInjectionContext(injector, () => createSchemaFromFields<FormWithBothValidations>(fields, registry, options)),
        ).not.toThrow();
      });

      it('should maintain backwards compatibility with array-based crossFieldValidators', () => {
        const crossFieldValidators = [
          {
            sourceFieldKey: 'field1',
            config: { type: 'custom' as const, expression: 'fieldValue === "test"' },
          },
        ];

        const fields: FieldDef<any>[] = [{ type: 'input', key: 'field1' }];

        // Old API: passing array directly as third argument - should not throw
        expect(() => runInInjectionContext(injector, () => createSchemaFromFields(fields, registry, crossFieldValidators))).not.toThrow();
      });
    });
  });

  // Test Suite 1.2: fieldsToDefaultValues()
  describe('fieldsToDefaultValues()', () => {
    // 1.2.1 Basic Default Value Extraction
    describe('Basic Default Value Extraction', () => {
      it('should return empty object for empty fields array', () => {
        const result = fieldsToDefaultValues([], registry);
        expect(result).toEqual({});
      });

      it('should extract default values from single field', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name', value: 'John' }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: 'John' });
      });

      it('should extract default values from multiple fields', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name', value: 'John' },
          { type: 'input', key: 'email', value: 'john@example.com' },
          { type: 'checkbox', key: 'subscribe', value: true },
        ];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({
          name: 'John',
          email: 'john@example.com',
          subscribe: true,
        });
      });

      it('should skip fields without keys', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name', value: 'John' }, { type: 'input', value: 'orphan' } as any];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: 'John' });
      });

      it('should skip fields with undefined default values', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name', value: 'John' },
          { type: 'text', key: 'label' }, // text field, excluded
        ];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: 'John' });
      });
    });

    // 1.2.2 Value Handling Modes
    describe('Value Handling Modes', () => {
      it('should skip excluded fields (text)', () => {
        const fields: FieldDef<any>[] = [
          { type: 'text', key: 'label', value: 'Label Text' },
          { type: 'input', key: 'name', value: 'John' },
        ];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: 'John' });
      });

      it('should skip excluded fields (button)', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name', value: 'John' },
          { type: 'button', key: 'submit', value: 'Submit' },
        ];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: 'John' });
      });

      it('should process included fields (input)', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name', value: 'John' }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: 'John' });
      });

      it('should process included fields (checkbox)', () => {
        const fields: FieldDef<any>[] = [{ type: 'checkbox', key: 'agree', value: true }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ agree: true });
      });

      it('should handle flatten fields correctly', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'row',
            key: 'row1',
            fields: [
              { type: 'input', key: 'firstName', value: 'John' },
              { type: 'input', key: 'lastName', value: 'Doe' },
            ],
          },
        ];
        const result = fieldsToDefaultValues(fields, registry);
        // Row fields are presentational and should not contribute to form values
        expect(result).toEqual({});
      });
    });

    // 1.2.3 Field Type Specific Defaults
    describe('Field Type Specific Defaults', () => {
      it('should use empty string for input fields without value', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name' }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: '' });
      });

      it('should use false for checkbox fields without value', () => {
        const fields: FieldDef<any>[] = [{ type: 'checkbox', key: 'agree' }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ agree: false });
      });

      it('should use empty array for array fields', () => {
        const fields: FieldDef<any>[] = [{ type: 'array', key: 'items' }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ items: [] });
      });

      it('should use explicit value when provided', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name', value: 'Explicit' }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: 'Explicit' });
      });

      it('should use explicit defaultValue when provided', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name', value: 'Default' } as any];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: 'Default' });
      });

      it('should handle null values correctly', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name', value: null }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: '' });
      });

      it('should handle null values for checkbox correctly', () => {
        const fields: FieldDef<any>[] = [{ type: 'checkbox', key: 'agree', value: null }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ agree: false });
      });

      it('should handle undefined values correctly', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name', value: undefined }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: '' });
      });
    });

    // 1.2.4 Nested Structures
    describe('Nested Structures', () => {
      it('should extract nested defaults from group fields', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'group',
            key: 'address',
            fields: [
              { type: 'input', key: 'street', value: '123 Main St' },
              { type: 'input', key: 'city', value: 'Boston' },
            ],
          },
        ];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({
          address: {
            street: '123 Main St',
            city: 'Boston',
          },
        });
      });

      it('should flatten values from row/page fields correctly', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'page',
            key: 'page1',
            fields: [
              { type: 'input', key: 'name', value: 'John' },
              { type: 'input', key: 'email', value: 'john@example.com' },
            ],
          },
        ];
        const result = fieldsToDefaultValues(fields, registry);
        // Page fields are presentational and should not contribute to form values
        expect(result).toEqual({});
      });

      it('should handle deeply nested structures', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'group',
            key: 'user',
            fields: [
              { type: 'input', key: 'name', value: 'John' },
              {
                type: 'group',
                key: 'contact',
                fields: [
                  { type: 'input', key: 'email', value: 'john@example.com' },
                  { type: 'input', key: 'phone', value: '555-1234' },
                ],
              } as any,
            ],
          },
        ];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({
          user: {
            name: 'John',
            contact: {
              email: 'john@example.com',
              phone: '555-1234',
            },
          },
        });
      });
    });

    // 1.2.5 Edge Cases
    describe('Edge Cases', () => {
      it('should handle fields with value set to 0', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'count', value: 0 }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ count: 0 });
      });

      it('should handle fields with value set to empty string', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'name', value: '' }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ name: '' });
      });

      it('should handle fields with value set to false', () => {
        const fields: FieldDef<any>[] = [{ type: 'checkbox', key: 'agree', value: false }];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({ agree: false });
      });

      it('should handle mixed value types', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name', value: 'John' },
          { type: 'input', key: 'age', value: 30 },
          { type: 'checkbox', key: 'active', value: true },
          { type: 'array', key: 'tags', value: ['tag1', 'tag2'] },
        ];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({
          name: 'John',
          age: 30,
          active: true,
          tags: ['tag1', 'tag2'],
        });
      });

      it('should handle fields with special characters in keys', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'user-name', value: 'John' },
          { type: 'input', key: 'email_address', value: 'john@example.com' },
        ];
        const result = fieldsToDefaultValues(fields, registry);
        expect(result).toEqual({
          'user-name': 'John',
          email_address: 'john@example.com',
        });
      });
    });

    // 1.2.6 Type Safety
    describe('Type Safety', () => {
      it('should return correctly typed TModel', () => {
        interface UserModel {
          name: string;
          email: string;
          age: number;
        }

        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'name', value: 'John' },
          { type: 'input', key: 'email', value: 'john@example.com' },
          { type: 'input', key: 'age', value: 30 },
        ];

        const result = fieldsToDefaultValues<UserModel>(fields, registry);
        expect(result).toEqual({
          name: 'John',
          email: 'john@example.com',
          age: 30,
        });
      });

      it('should work with complex model types', () => {
        interface ComplexModel {
          user: {
            name: string;
            contact: {
              email: string;
            };
          };
        }

        const fields: FieldDef<any>[] = [
          {
            type: 'group',
            key: 'user',
            fields: [
              { type: 'input', key: 'name', value: 'John' },
              {
                type: 'group',
                key: 'contact',
                fields: [{ type: 'input', key: 'email', value: 'john@example.com' }],
              } as any,
            ],
          },
        ];

        const result = fieldsToDefaultValues<ComplexModel>(fields, registry);
        expect(result).toEqual({
          user: {
            name: 'John',
            contact: {
              email: 'john@example.com',
            },
          },
        });
      });
    });
  });
});
