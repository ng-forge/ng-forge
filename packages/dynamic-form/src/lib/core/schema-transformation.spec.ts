import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as angularSignals from '@angular/forms/signals';
import { form } from '@angular/forms/signals';
import { SchemaApplicationConfig, SchemaDefinition } from '../models/schemas';
import { FieldDef } from '../definitions';
import { FieldTypeDefinition } from '../models/field-type';
import { RootFormRegistryService, SchemaRegistryService } from './registry';
import { applySchema, createSchemaFunction } from './schema-application';
import { createSchemaFromFields, fieldsToDefaultValues } from './schema-builder';
import * as validatorFactory from './validation/validator-factory';
import * as logicApplicator from './logic/logic-applicator';

describe('schema-transformation', () => {
  let injector: Injector;
  let rootFormRegistry: RootFormRegistryService;
  let schemaRegistry: SchemaRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFormRegistryService, SchemaRegistryService],
    });

    injector = TestBed.inject(Injector);
    rootFormRegistry = TestBed.inject(RootFormRegistryService);
    schemaRegistry = TestBed.inject(SchemaRegistryService);
  });

  describe('applySchema', () => {
    describe('schema resolution', () => {
      it('should log error and return early when schema not found', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
          const applySpy = vi.spyOn(angularSignals, 'apply');

          const config: SchemaApplicationConfig = {
            type: 'apply',
            schema: 'nonexistentSchema',
          };

          applySchema(config, formInstance().controls.email);

          expect(consoleErrorSpy).toHaveBeenCalledWith('Schema not found: nonexistentSchema');
          expect(applySpy).not.toHaveBeenCalled();

          consoleErrorSpy.mockRestore();
          applySpy.mockRestore();
        });
      });

      it('should apply schema when found in registry', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'emailSchema',
            validators: [{ type: 'email' }],
          });

          const applySpy = vi.spyOn(angularSignals, 'apply');
          const config: SchemaApplicationConfig = {
            type: 'apply',
            schema: 'emailSchema',
          };

          applySchema(config, formInstance().controls.email);

          expect(applySpy).toHaveBeenCalledTimes(1);
          applySpy.mockRestore();
        });
      });
    });

    describe('strategy branching', () => {
      it('should use apply strategy', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const applySpy = vi.spyOn(angularSignals, 'apply');
          const config: SchemaApplicationConfig = {
            type: 'apply',
            schema: 'testSchema',
          };

          applySchema(config, formInstance().controls.email);

          expect(applySpy).toHaveBeenCalledTimes(1);
          applySpy.mockRestore();
        });
      });

      it('should use applyWhen strategy with condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ contactMethod: 'email', email: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const applyWhenSpy = vi.spyOn(angularSignals, 'applyWhen');
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

          applySchema(config, formInstance().controls.email);

          expect(applyWhenSpy).toHaveBeenCalledTimes(1);
          applyWhenSpy.mockRestore();
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

          const applyWhenSpy = vi.spyOn(angularSignals, 'applyWhen');
          const config: SchemaApplicationConfig = {
            type: 'applyWhen',
            schema: 'testSchema',
            // No condition property
          };

          applySchema(config, formInstance().controls.email);

          expect(applyWhenSpy).not.toHaveBeenCalled();
          applyWhenSpy.mockRestore();
        });
      });

      it('should use applyWhenValue strategy with type predicate', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ value: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const applyWhenValueSpy = vi.spyOn(angularSignals, 'applyWhenValue');
          const config: SchemaApplicationConfig = {
            type: 'applyWhenValue',
            schema: 'testSchema',
            typePredicate: 'typeof value === "string"',
          };

          applySchema(config, formInstance().controls.value);

          expect(applyWhenValueSpy).toHaveBeenCalledTimes(1);
          applyWhenValueSpy.mockRestore();
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

          const applyWhenValueSpy = vi.spyOn(angularSignals, 'applyWhenValue');
          const config: SchemaApplicationConfig = {
            type: 'applyWhenValue',
            schema: 'testSchema',
            // No typePredicate property
          };

          applySchema(config, formInstance().controls.value);

          expect(applyWhenValueSpy).not.toHaveBeenCalled();
          applyWhenValueSpy.mockRestore();
        });
      });

      it('should use applyEach strategy for array fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ items: ['item1', 'item2'] });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const applyEachSpy = vi.spyOn(angularSignals, 'applyEach');
          const config: SchemaApplicationConfig = {
            type: 'applyEach',
            schema: 'testSchema',
          };

          applySchema(config, formInstance().controls.items);

          expect(applyEachSpy).toHaveBeenCalledTimes(1);
          applyEachSpy.mockRestore();
        });
      });

      it('should handle unknown strategy type silently', () => {
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
    it('should apply validators from schema', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');
        const schema: SchemaDefinition = {
          name: 'testSchema',
          validators: [{ type: 'required' }, { type: 'email' }],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(formInstance().controls.email);

        expect(applyValidatorSpy).toHaveBeenCalledTimes(2);
        applyValidatorSpy.mockRestore();
      });
    });

    it('should apply logic from schema', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        const applyLogicSpy = vi.spyOn(logicApplicator, 'applyLogic');
        const schema: SchemaDefinition = {
          name: 'testSchema',
          logic: [{ type: 'hidden', condition: false }],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(formInstance().controls.email);

        expect(applyLogicSpy).toHaveBeenCalledTimes(1);
        applyLogicSpy.mockRestore();
      });
    });

    it('should apply sub-schemas recursively', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        schemaRegistry.registerSchema({
          name: 'subSchema',
          validators: [{ type: 'email' }],
        });

        const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator');
        const schema: SchemaDefinition = {
          name: 'testSchema',
          subSchemas: [{ type: 'apply', schema: 'subSchema' }],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(formInstance().controls.email);

        // Should apply validators from sub-schema
        expect(applyValidatorSpy).toHaveBeenCalled();
        applyValidatorSpy.mockRestore();
      });
    });

    it('should handle schema with no validators, logic, or sub-schemas', () => {
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

    it('should apply validators, logic, and sub-schemas in correct order', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });
        const formInstance = form(formValue);
        rootFormRegistry.registerRootForm(formInstance);

        schemaRegistry.registerSchema({
          name: 'subSchema',
          validators: [{ type: 'email' }],
        });

        const callOrder: string[] = [];
        const applyValidatorSpy = vi.spyOn(validatorFactory, 'applyValidator').mockImplementation(() => {
          callOrder.push('validator');
        });
        const applyLogicSpy = vi.spyOn(logicApplicator, 'applyLogic').mockImplementation(() => {
          callOrder.push('logic');
        });
        const applySchemaSpy = vi.spyOn(angularSignals, 'apply').mockImplementation(() => {
          callOrder.push('sub-schema');
        });

        const schema: SchemaDefinition = {
          name: 'testSchema',
          validators: [{ type: 'required' }],
          logic: [{ type: 'hidden', condition: false }],
          subSchemas: [{ type: 'apply', schema: 'subSchema' }],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(formInstance().controls.email);

        // Verify order: validators → logic → sub-schemas
        expect(callOrder[0]).toBe('validator');
        expect(callOrder[1]).toBe('logic');

        applyValidatorSpy.mockRestore();
        applyLogicSpy.mockRestore();
        applySchemaSpy.mockRestore();
      });
    });
  });

  describe('createSchemaFromFields', () => {
    describe('value handling modes', () => {
      it('should skip fields with exclude value handling', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([
            ['excludeType', { valueHandling: 'exclude' }],
          ]);

          const fields: FieldDef[] = [{ key: 'field1', type: 'excludeType' }];

          const schemaFn = createSchemaFromFields(fields, registry);
          const formValue = signal({});
          const formInstance = form(formValue, schemaFn);

          // Field should not be processed
          expect(formInstance().controls).toEqual({});
        });
      });

      it('should flatten fields with flatten value handling', () => {
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

          // Children should be processed at root level
          expect(() => schemaFn(formInstance().controls as any)).not.toThrow();
        });
      });

      it('should handle flatten mode with no fields property', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([['page', { valueHandling: 'flatten' }]]);

          const fields: FieldDef[] = [{ key: 'page1', type: 'page' }]; // No fields property

          const formValue = signal({});
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            const formInstance = form(formValue, schemaFn);
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
              fields: [{ key: 'field1', type: 'input' }], // Array
            },
          ];

          const formValue = signal({ field1: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => schemaFn(formInstance().controls as any)).not.toThrow();
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
              fields: { field1: { key: 'field1', type: 'input' } }, // Object
            },
          ];

          const formValue = signal({ field1: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => schemaFn(formInstance().controls as any)).not.toThrow();
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
              fields: [
                { type: 'input' }, // No key
                { key: 'field2', type: 'input' },
              ],
            },
          ];

          const formValue = signal({ field2: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => schemaFn(formInstance().controls as any)).not.toThrow();
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
              fields: [{ key: 'missingField', type: 'input' }], // Not in form
            },
          ];

          const formValue = signal({ field1: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => schemaFn(formInstance().controls as any)).not.toThrow();
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

          expect(() => schemaFn(formInstance().controls as any)).not.toThrow();
        });
      });
    });

    describe('field path checks', () => {
      it('should skip fields when path is not found', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([['input', { valueHandling: 'include' }]]);

          const fields: FieldDef[] = [
            { key: 'field1', type: 'input' },
            { key: 'missingField', type: 'input' }, // Not in form
          ];

          const formValue = signal({ field1: '' });
          const formInstance = form(formValue);
          rootFormRegistry.registerRootForm(formInstance);

          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => schemaFn(formInstance().controls as any)).not.toThrow();
        });
      });

      it('should handle empty fields array', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>();
          const fields: FieldDef[] = [];

          const formValue = signal({});
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            const formInstance = form(formValue, schemaFn);
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
        { type: 'input', defaultValue: 'value1' }, // No key
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
        { key: 'field1', type: 'input' }, // No defaultValue
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
