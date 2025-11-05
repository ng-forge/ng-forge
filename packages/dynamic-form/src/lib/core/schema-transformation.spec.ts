import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { form, schema } from '@angular/forms/signals';
import { SchemaApplicationConfig, SchemaDefinition } from '../models/schemas';
import { FieldDef } from '../definitions';
import { FieldTypeDefinition } from '../models/field-type';
import { RootFormRegistryService, SchemaRegistryService, FunctionRegistryService, FieldContextRegistryService } from './registry';
import { applySchema, createSchemaFunction } from './schema-application';
import { createSchemaFromFields, fieldsToDefaultValues } from './schema-builder';

describe('schema-transformation', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;
  let schemaRegistry: SchemaRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService, SchemaRegistryService, FunctionRegistryService, FieldContextRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
    schemaRegistry = TestBed.inject(SchemaRegistryService);
  });

  describe('applySchema', () => {
    describe('schema resolution', () => {
      it('should log error when schema not found', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
          const config: SchemaApplicationConfig = {
            type: 'apply',
            schema: 'nonexistentSchema',
          };

          applySchema(config, formInstance().controls.email);

          expect(consoleErrorSpy).toHaveBeenCalledWith('Schema not found: nonexistentSchema');
          consoleErrorSpy.mockRestore();
        });
      });

      it('should handle found schema without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'emailSchema',
            validators: [{ type: 'email' }],
          });

          const config: SchemaApplicationConfig = {
            type: 'apply',
            schema: 'emailSchema',
          };

          expect(() => {
            applySchema(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });

    describe('strategy branching', () => {
      it('should handle apply strategy without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'apply',
            schema: 'testSchema',
          };

          expect(() => {
            applySchema(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle applyWhen strategy with condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ contactMethod: 'email', email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'applyWhen',
            schema: 'testSchema',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'equals',
              value: 'email',
            },
          };

          expect(() => {
            applySchema(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should skip applyWhen when condition is missing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'applyWhen',
            schema: 'testSchema',
          };

          expect(() => {
            applySchema(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });

      it('should handle applyWhenValue strategy with type predicate', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ value: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'applyWhenValue',
            schema: 'testSchema',
            typePredicate: 'typeof value === "string"',
          };

          expect(() => {
            applySchema(config, formInstance().controls.value);
          }).not.toThrow();
        });
      });

      it('should skip applyWhenValue when typePredicate is missing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ value: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'applyWhenValue',
            schema: 'testSchema',
          };

          expect(() => {
            applySchema(config, formInstance().controls.value);
          }).not.toThrow();
        });
      });

      it('should handle applyEach strategy for array fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ items: ['item1', 'item2'] });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'applyEach',
            schema: 'testSchema',
          };

          expect(() => {
            applySchema(config, formInstance().controls.items);
          }).not.toThrow();
        });
      });

      it('should handle unknown strategy type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'unknownStrategy' as any,
            schema: 'testSchema',
          };

          expect(() => {
            applySchema(config, formInstance().controls.email);
          }).not.toThrow();
        });
      });
    });
  });

  describe('createSchemaFunction', () => {
    it('should handle schema with validators without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const schema: SchemaDefinition = {
          name: 'testSchema',
          validators: [{ type: 'required' }, { type: 'email' }],
        };

        const schemaFn = createSchemaFunction(schema);

        expect(() => {
          schemaFn(formInstance().controls.email);
        }).not.toThrow();
      });
    });

    it('should handle schema with logic without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const schema: SchemaDefinition = {
          name: 'testSchema',
          logic: [{ type: 'hidden', condition: false }],
        };

        const schemaFn = createSchemaFunction(schema);

        expect(() => {
          schemaFn(formInstance().controls.email);
        }).not.toThrow();
      });
    });

    it('should handle schema with sub-schemas without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        schemaRegistry.registerSchema({
          name: 'subSchema',
          validators: [{ type: 'email' }],
        });

        const schema: SchemaDefinition = {
          name: 'testSchema',
          subSchemas: [{ type: 'apply', schema: 'subSchema' }],
        };

        const schemaFn = createSchemaFunction(schema);

        expect(() => {
          schemaFn(formInstance().controls.email);
        }).not.toThrow();
      });
    });

    it('should handle empty schema without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const schema: SchemaDefinition = {
          name: 'emptySchema',
        };

        const schemaFn = createSchemaFunction(schema);

        expect(() => {
          schemaFn(formInstance().controls.email);
        }).not.toThrow();
      });
    });

    it('should handle schema with validators, logic, and sub-schemas', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        schemaRegistry.registerSchema({
          name: 'subSchema',
          validators: [{ type: 'email' }],
        });

        const schema: SchemaDefinition = {
          name: 'testSchema',
          validators: [{ type: 'required' }],
          logic: [{ type: 'hidden', condition: false }],
          subSchemas: [{ type: 'apply', schema: 'subSchema' }],
        };

        const schemaFn = createSchemaFunction(schema);

        expect(() => {
          schemaFn(formInstance().controls.email);
        }).not.toThrow();
      });
    });
  });

  describe('createSchemaFromFields', () => {
    describe('value handling modes', () => {
      it('should handle exclude value handling', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([['excludeType', { valueHandling: 'exclude' }]]);

          const fields: FieldDef[] = [{ key: 'field1', type: 'excludeType' }];

          const schemaFn = createSchemaFromFields(fields, registry);
          const formValue = signal({});

          expect(() => {
            form(formValue, schemaFn);
          }).not.toThrow();
        });
      });

      it('should handle flatten value handling', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([
            ['page', { valueHandling: 'flatten' }],
            ['input', { valueHandling: 'include' }],
          ]);

          const fields: FieldDef[] = [
            {
              key: 'page1',
              type: 'page',
              fields: [
                { key: 'field1', type: 'input' },
                { key: 'field2', type: 'input' },
              ],
            },
          ];

          const formValue = signal({ field1: '', field2: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            schemaFn(formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should handle flatten mode with no fields property', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([['page', { valueHandling: 'flatten' }]]);

          const fields: FieldDef[] = [{ key: 'page1', type: 'page' }];

          const formValue = signal({});
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            form(formValue, schemaFn);
          }).not.toThrow();
        });
      });

      it('should handle flatten mode with array fields', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([
            ['page', { valueHandling: 'flatten' }],
            ['input', { valueHandling: 'include' }],
          ]);

          const fields: FieldDef[] = [
            {
              key: 'page1',
              type: 'page',
              fields: [{ key: 'field1', type: 'input' }],
            },
          ];

          const formValue = signal({ field1: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            schemaFn(formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should handle flatten mode with object fields', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([
            ['group', { valueHandling: 'flatten' }],
            ['input', { valueHandling: 'include' }],
          ]);

          const fields: FieldDef[] = [
            {
              key: 'group1',
              type: 'group',
              fields: { field1: { key: 'field1', type: 'input' } },
            },
          ];

          const formValue = signal({ field1: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            schemaFn(formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should skip flattened child fields without keys', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([
            ['page', { valueHandling: 'flatten' }],
            ['input', { valueHandling: 'include' }],
          ]);

          const fields: FieldDef[] = [
            {
              key: 'page1',
              type: 'page',
              fields: [{ type: 'input' }, { key: 'field2', type: 'input' }],
            },
          ];

          const formValue = signal({ field2: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            schemaFn(formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should skip flattened fields when path not found', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([
            ['page', { valueHandling: 'flatten' }],
            ['input', { valueHandling: 'include' }],
          ]);

          const fields: FieldDef[] = [
            {
              key: 'page1',
              type: 'page',
              fields: [{ key: 'missingField', type: 'input' }],
            },
          ];

          const formValue = signal({ field1: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            schemaFn(formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should process regular fields with include value handling', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([['input', { valueHandling: 'include' }]]);

          const fields: FieldDef[] = [{ key: 'field1', type: 'input' }];

          const formValue = signal({ field1: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            schemaFn(formInstance().controls as any);
          }).not.toThrow();
        });
      });
    });

    describe('field path checks', () => {
      it('should skip fields when path is not found', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([['input', { valueHandling: 'include' }]]);

          const fields: FieldDef[] = [
            { key: 'field1', type: 'input' },
            { key: 'missingField', type: 'input' },
          ];

          const formValue = signal({ field1: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            schemaFn(formInstance().controls as any);
          }).not.toThrow();
        });
      });

      it('should handle empty fields array', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>();
          const fields: FieldDef[] = [];

          const formValue = signal({});
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            form(formValue, schemaFn);
          }).not.toThrow();
        });
      });
    });
  });

  describe('fieldsToDefaultValues', () => {
    it('should extract default values from fields', () => {
      const registry = new Map<string, FieldTypeDefinition>([['input', { valueHandling: 'include' }]]);

      const fields: FieldDef[] = [
        { key: 'field1', type: 'input', defaultValue: 'value1' },
        { key: 'field2', type: 'input', defaultValue: 'value2' },
      ];

      const defaultValues = fieldsToDefaultValues(fields, registry);

      expect(defaultValues).toEqual({
        field1: 'value1',
        field2: 'value2',
      });
    });

    it('should skip fields without keys', () => {
      const registry = new Map<string, FieldTypeDefinition>([['input', { valueHandling: 'include' }]]);

      const fields: FieldDef[] = [
        { type: 'input', defaultValue: 'value1' },
        { key: 'field2', type: 'input', defaultValue: 'value2' },
      ];

      const defaultValues = fieldsToDefaultValues(fields, registry);

      expect(defaultValues).toEqual({
        field2: 'value2',
      });
    });

    it('should skip fields with undefined default values', () => {
      const registry = new Map<string, FieldTypeDefinition>([['input', { valueHandling: 'include' }]]);

      const fields: FieldDef[] = [
        { key: 'field1', type: 'input' },
        { key: 'field2', type: 'input', defaultValue: 'value2' },
      ];

      const defaultValues = fieldsToDefaultValues(fields, registry);

      expect(defaultValues).toEqual({
        field2: 'value2',
      });
    });

    it('should handle empty fields array', () => {
      const registry = new Map<string, FieldTypeDefinition>();
      const fields: FieldDef[] = [];

      const defaultValues = fieldsToDefaultValues(fields, registry);

      expect(defaultValues).toEqual({});
    });
  });
});
