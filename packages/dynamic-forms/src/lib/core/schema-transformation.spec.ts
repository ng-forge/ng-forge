import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { form, schema } from '@angular/forms/signals';
import { SchemaApplicationConfig, SchemaDefinition } from '../models/schemas';
import { FieldDef } from '../definitions/base/field-def';
import { FieldTypeDefinition } from '../models/field-type';
import { SchemaRegistryService, FunctionRegistryService, FieldContextRegistryService, RootFormRegistryService } from './registry';
import { FormStateManager } from '../state/form-state-manager';
import { applySchema, createSchemaFunction } from './schema-application';
import { createSchemaFromFields, fieldsToDefaultValues } from './schema-builder';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { ConsoleLogger } from '../providers/features/logger/console-logger';

describe('schema-transformation', () => {
  let injector: Injector;
  let schemaRegistry: SchemaRegistryService;

  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SchemaRegistryService,
        FunctionRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        FieldContextRegistryService,
        // Provide ConsoleLogger to enable logging in tests
        { provide: DynamicFormLogger, useValue: new ConsoleLogger() },
      ],
    });

    injector = TestBed.inject(Injector);
    schemaRegistry = TestBed.inject(SchemaRegistryService);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('applySchema', () => {
    describe('schema resolution', () => {
      it('should log error when schema not found', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

          const config: SchemaApplicationConfig = {
            type: 'apply',
            schema: 'nonexistentSchema',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path.email);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[Dynamic Forms]',
            "Schema not found: 'nonexistentSchema'. Available schemas: <none>. Ensure the schema is registered in your schema registry.",
          );
          consoleErrorSpy.mockRestore();
        });
      });

      it('should handle found schema without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });

          schemaRegistry.registerSchema({
            name: 'emailSchema',
            validators: [{ type: 'email' }],
          });

          const config: SchemaApplicationConfig = {
            type: 'apply',
            schema: 'emailSchema',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applySchema(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('strategy branching', () => {
      it('should handle apply strategy without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'apply',
            schema: 'testSchema',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applySchema(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle applyWhen strategy with condition', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ contactMethod: 'email', email: '' });

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

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applySchema(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should skip applyWhen when condition is missing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'applyWhen',
            schema: 'testSchema',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applySchema(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle applyWhenValue strategy with type predicate', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ value: '' });

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'applyWhenValue',
            schema: 'testSchema',
            typePredicate: 'value && value.type === "text"',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applySchema(config, path.value);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should skip applyWhenValue when typePredicate is missing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ value: '' });

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'applyWhenValue',
            schema: 'testSchema',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applySchema(config, path.value);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle applyEach strategy for array fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ items: ['item1', 'item2'] });

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'applyEach',
            schema: 'testSchema',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applySchema(config, path.items);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle unknown strategy type without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });

          schemaRegistry.registerSchema({
            name: 'testSchema',
            validators: [],
          });

          const config: SchemaApplicationConfig = {
            type: 'unknownStrategy' as any,
            schema: 'testSchema',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                applySchema(config, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });
  });

  describe('createSchemaFunction', () => {
    it('should handle schema with validators without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });

        const schemaDef: SchemaDefinition = {
          name: 'testSchema',
          validators: [{ type: 'required' }, { type: 'email' }],
        };

        const schemaFn = createSchemaFunction(schemaDef);

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              schemaFn(path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
      });
    });

    it('should handle schema with logic without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });

        const schemaDef: SchemaDefinition = {
          name: 'testSchema',
          logic: [{ type: 'hidden', condition: false }],
        };

        const schemaFn = createSchemaFunction(schemaDef);

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              schemaFn(path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
      });
    });

    it('should handle schema with sub-schemas without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });

        schemaRegistry.registerSchema({
          name: 'subSchema',
          validators: [{ type: 'email' }],
        });

        const schemaDef: SchemaDefinition = {
          name: 'testSchema',
          subSchemas: [{ type: 'apply', schema: 'subSchema' }],
        };

        const schemaFn = createSchemaFunction(schemaDef);

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              schemaFn(path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
      });
    });

    it('should handle empty schema without throwing', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });

        const schemaDef: SchemaDefinition = {
          name: 'emptySchema',
        };

        const schemaFn = createSchemaFunction(schemaDef);

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              schemaFn(path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
      });
    });

    it('should handle schema with validators, logic, and sub-schemas', () => {
      runInInjectionContext(injector, () => {
        const formValue = signal({ email: '' });

        schemaRegistry.registerSchema({
          name: 'subSchema',
          validators: [{ type: 'email' }],
        });

        const schemaDef: SchemaDefinition = {
          name: 'testSchema',
          validators: [{ type: 'required' }],
          logic: [{ type: 'hidden', condition: false }],
          subSchemas: [{ type: 'apply', schema: 'subSchema' }],
        };

        const schemaFn = createSchemaFunction(schemaDef);

        const formInstance = form(
          formValue,
          schema<typeof formValue>((path) => {
            expect(() => {
              schemaFn(path.email);
            }).not.toThrow();
          }),
        );
        mockFormSignal.set(formInstance);
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
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            const formInstance = form(formValue, schemaFn);
            mockFormSignal.set(formInstance);
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
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            const formInstance = form(formValue, schemaFn);
            mockFormSignal.set(formInstance);
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
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            const formInstance = form(formValue, schemaFn);
            mockFormSignal.set(formInstance);
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
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            const formInstance = form(formValue, schemaFn);
            mockFormSignal.set(formInstance);
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
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            const formInstance = form(formValue, schemaFn);
            mockFormSignal.set(formInstance);
          }).not.toThrow();
        });
      });

      it('should process regular fields with include value handling', () => {
        runInInjectionContext(injector, () => {
          const registry = new Map<string, FieldTypeDefinition>([['input', { valueHandling: 'include' }]]);

          const fields: FieldDef[] = [{ key: 'field1', type: 'input' }];

          const formValue = signal({ field1: '' });
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            const formInstance = form(formValue, schemaFn);
            mockFormSignal.set(formInstance);
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
          const schemaFn = createSchemaFromFields(fields, registry);

          expect(() => {
            const formInstance = form(formValue, schemaFn);
            mockFormSignal.set(formInstance);
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
        { key: 'field1', type: 'input', value: 'value1' },
        { key: 'field2', type: 'input', value: 'value2' },
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
        { type: 'input', value: 'value1' },
        { key: 'field2', type: 'input', value: 'value2' },
      ];

      const defaultValues = fieldsToDefaultValues(fields, registry);

      expect(defaultValues).toEqual({
        field2: 'value2',
      });
    });

    it('should use empty string for fields without explicit default values', () => {
      const registry = new Map<string, FieldTypeDefinition>([['input', { valueHandling: 'include' }]]);

      const fields: FieldDef[] = [
        { key: 'field1', type: 'input' },
        { key: 'field2', type: 'input', value: 'value2' },
      ];

      const defaultValues = fieldsToDefaultValues(fields, registry);

      expect(defaultValues).toEqual({
        field1: '',
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
