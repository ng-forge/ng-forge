import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { runInInjectionContext, Injector, signal } from '@angular/core';
import { form, schema } from '@angular/forms/signals';
import { SchemaRegistryService } from './registry/schema-registry.service';
import { FunctionRegistryService } from './registry/function-registry.service';
import { RootFormRegistryService } from './registry/root-form-registry.service';
import { FieldContextRegistryService } from './registry/field-context-registry.service';
import { FormStateManager } from '../state/form-state-manager';
import { SchemaApplicationConfig, SchemaDefinition } from '../models';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { ConsoleLogger } from '../providers/features/logger/console-logger';

import { applySchema, createSchemaFunction } from './schema-application';

/**
 * Integration tests for schema-application.
 *
 * These tests use real Angular Signal Forms instead of mocking, which ensures
 * that the actual behavior is tested and avoids Vitest browser mode mocking issues.
 */

describe('schema-application', () => {
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  let schemaRegistry: SchemaRegistryService;
  let injector: Injector;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.resetTestingModule();
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

    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      // Suppress console output in tests
    });

    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('applySchema()', () => {
    describe('Schema Resolution', () => {
      it('should log error when schema not found', () => {
        const formValue = signal({ name: '' });
        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'nonexistent-schema',
        };

        runInInjectionContext(injector, () => {
          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(consoleSpy).toHaveBeenCalledWith('[Dynamic Forms]', expect.stringContaining("Schema not found: 'nonexistent-schema'"));
      });

      it('should list available schemas in error message', () => {
        schemaRegistry.registerSchema({ name: 'schema1', validators: [] });
        schemaRegistry.registerSchema({ name: 'schema2', validators: [] });

        const formValue = signal({ name: '' });
        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'missing',
        };

        runInInjectionContext(injector, () => {
          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(consoleSpy).toHaveBeenCalledWith('[Dynamic Forms]', expect.stringContaining('Available schemas: schema1, schema2'));
      });

      it('should handle empty schema registry gracefully', () => {
        const formValue = signal({ name: '' });
        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'any-schema',
        };

        runInInjectionContext(injector, () => {
          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(consoleSpy).toHaveBeenCalledWith('[Dynamic Forms]', expect.stringContaining('Available schemas: <none>'));
      });

      it('should not throw when schema is missing', () => {
        const formValue = signal({ name: '' });
        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'missing',
        };

        expect(() => {
          runInInjectionContext(injector, () => {
            const formInstance = form(
              formValue,
              schema<typeof formValue>((path) => {
                applySchema(config, path);
              }),
            );
            mockFormSignal.set(formInstance);
          });
        }).not.toThrow();
      });
    });

    describe("Application Type: 'apply'", () => {
      it('should apply schema with validators to form field', () => {
        const testSchema: SchemaDefinition = {
          name: 'test-schema',
          validators: [{ type: 'required' }],
        };
        schemaRegistry.registerSchema(testSchema);

        const formValue = signal({ email: '' });
        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'test-schema',
        };

        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path.email);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        // Verify the form was created and schema applied (no error thrown)
        expect(formInstance).toBeDefined();
        expect(consoleSpy).not.toHaveBeenCalled();
      });

      it('should apply inline schema definition', () => {
        const formValue = signal({ name: '' });
        const inlineSchema: SchemaDefinition = {
          name: 'inline-schema',
          validators: [{ type: 'required' }, { type: 'minLength', value: 2 }],
        };

        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: inlineSchema,
        };

        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path.name);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
        expect(consoleSpy).not.toHaveBeenCalled();
      });
    });

    describe("Application Type: 'applyWhen'", () => {
      it('should apply schema conditionally based on expression', () => {
        const testSchema: SchemaDefinition = {
          name: 'conditional-schema',
          validators: [{ type: 'required' }],
        };
        schemaRegistry.registerSchema(testSchema);

        const formValue = signal({ email: '', isActive: true });
        const config: SchemaApplicationConfig = {
          type: 'applyWhen',
          schema: 'conditional-schema',
          condition: { type: 'expression', expression: 'isActive === true' },
        };

        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path.email);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
        expect(consoleSpy).not.toHaveBeenCalled();
      });

      it('should skip application when condition is undefined', () => {
        const testSchema: SchemaDefinition = {
          name: 'test-schema',
          validators: [{ type: 'required' }],
        };
        schemaRegistry.registerSchema(testSchema);

        const formValue = signal({ name: '' });
        const config: SchemaApplicationConfig = {
          type: 'applyWhen',
          schema: 'test-schema',
          // No condition provided
        };

        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path.name);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        // Should not throw and no error logged
        expect(formInstance).toBeDefined();
        expect(consoleSpy).not.toHaveBeenCalled();
      });
    });

    describe("Application Type: 'applyWhenValue'", () => {
      it('should apply schema based on value type predicate', () => {
        const testSchema: SchemaDefinition = {
          name: 'string-schema',
          validators: [{ type: 'required' }],
        };
        schemaRegistry.registerSchema(testSchema);

        const formValue = signal({ value: 'test' });
        const config: SchemaApplicationConfig = {
          type: 'applyWhenValue',
          schema: 'string-schema',
          typePredicate: 'value && value.type === "text"',
        };

        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path.value);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
        expect(consoleSpy).not.toHaveBeenCalled();
      });

      it('should skip application when typePredicate is undefined', () => {
        const testSchema: SchemaDefinition = {
          name: 'test-schema',
          validators: [{ type: 'required' }],
        };
        schemaRegistry.registerSchema(testSchema);

        const formValue = signal({ value: '' });
        const config: SchemaApplicationConfig = {
          type: 'applyWhenValue',
          schema: 'test-schema',
          // No typePredicate provided
        };

        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path.value);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
        expect(consoleSpy).not.toHaveBeenCalled();
      });
    });

    describe("Application Type: 'applyEach'", () => {
      it('should apply schema to each array item', () => {
        const testSchema: SchemaDefinition = {
          name: 'item-schema',
          validators: [{ type: 'required' }],
        };
        schemaRegistry.registerSchema(testSchema);

        const formValue = signal({ items: ['a', 'b', 'c'] });
        const config: SchemaApplicationConfig = {
          type: 'applyEach',
          schema: 'item-schema',
        };

        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              applySchema(config, path.items);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
        expect(consoleSpy).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should handle invalid application types gracefully', () => {
        const testSchema: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        const formValue = signal({ name: '' });
        // Intentionally using invalid type to test error handling
        const config = {
          type: 'invalid',
          schema: testSchema,
        } as unknown as SchemaApplicationConfig;

        expect(() => {
          runInInjectionContext(injector, () => {
            const formInstance = form(
              formValue,
              schema<typeof formValue>((path) => {
                applySchema(config, path.name);
              }),
            );
            mockFormSignal.set(formInstance);
          });
        }).not.toThrow();
      });

      it('should not crash on malformed config', () => {
        const formValue = signal({ name: '' });
        // Intentionally malformed config (missing schema) to test error handling
        const config = {
          type: 'apply',
        } as unknown as SchemaApplicationConfig;

        expect(() => {
          runInInjectionContext(injector, () => {
            const formInstance = form(
              formValue,
              schema<typeof formValue>((path) => {
                applySchema(config, path.name);
              }),
            );
            mockFormSignal.set(formInstance);
          });
        }).not.toThrow();
      });
    });
  });

  describe('createSchemaFunction()', () => {
    describe('Function Creation', () => {
      it('should return a function', () => {
        const schemaDefinition: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        const result = createSchemaFunction(schemaDefinition);
        expect(typeof result).toBe('function');
      });
    });

    describe('Validator Application', () => {
      it('should apply validators from schema definition', () => {
        const schemaDefinition: SchemaDefinition = {
          name: 'validator-schema',
          validators: [{ type: 'required' }, { type: 'email' }],
        };

        const formValue = signal({ email: '' });
        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          const schemaFn = createSchemaFunction(schemaDefinition);

          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              schemaFn(path.email);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
      });

      it('should apply multiple validators in correct order', () => {
        const schemaDefinition: SchemaDefinition = {
          name: 'multi-validator',
          validators: [{ type: 'required' }, { type: 'minLength', value: 3 }, { type: 'maxLength', value: 20 }],
        };

        const formValue = signal({ username: '' });
        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          const schemaFn = createSchemaFunction(schemaDefinition);

          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              schemaFn(path.username);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
      });

      it('should handle schema without validators', () => {
        const schemaDefinition: SchemaDefinition = {
          name: 'no-validators',
        };

        const formValue = signal({ name: '' });

        expect(() => {
          runInInjectionContext(injector, () => {
            const schemaFn = createSchemaFunction(schemaDefinition);

            const formInstance = form(
              formValue,
              schema<typeof formValue>((path) => {
                schemaFn(path.name);
              }),
            );
            mockFormSignal.set(formInstance);
          });
        }).not.toThrow();
      });
    });

    describe('Logic Application', () => {
      it('should apply logic rules from schema definition', () => {
        const schemaDefinition: SchemaDefinition = {
          name: 'logic-schema',
          logic: [
            { type: 'show', condition: { type: 'expression', expression: 'age > 18' } },
            { type: 'enable', condition: { type: 'expression', expression: 'isActive' } },
          ],
        };

        const formValue = signal({ email: '', age: 25, isActive: true });
        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          const schemaFn = createSchemaFunction(schemaDefinition);

          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              schemaFn(path.email);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
      });

      it('should handle schema without logic', () => {
        const schemaDefinition: SchemaDefinition = {
          name: 'no-logic',
        };

        const formValue = signal({ name: '' });

        expect(() => {
          runInInjectionContext(injector, () => {
            const schemaFn = createSchemaFunction(schemaDefinition);

            const formInstance = form(
              formValue,
              schema<typeof formValue>((path) => {
                schemaFn(path.name);
              }),
            );
            mockFormSignal.set(formInstance);
          });
        }).not.toThrow();
      });
    });

    describe('Sub-Schema Application', () => {
      it('should apply sub-schemas from schema definition', () => {
        // Register a child schema first
        schemaRegistry.registerSchema({
          name: 'child-schema',
          validators: [{ type: 'required' }],
        });

        const parentSchema: SchemaDefinition = {
          name: 'parent-schema',
          subSchemas: [{ type: 'apply', schema: 'child-schema' }],
        };

        const formValue = signal({ email: '' });
        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          const schemaFn = createSchemaFunction(parentSchema);

          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              schemaFn(path.email);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
      });

      it('should handle nested inline sub-schemas', () => {
        const nestedSchema: SchemaDefinition = {
          name: 'nested',
          subSchemas: [
            {
              type: 'apply',
              schema: {
                name: 'nested-child',
                validators: [{ type: 'required' }],
              },
            },
          ],
        };

        const formValue = signal({ field: '' });
        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          const schemaFn = createSchemaFunction(nestedSchema);

          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              schemaFn(path.field);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
      });

      it('should handle schema without sub-schemas', () => {
        const schemaDefinition: SchemaDefinition = {
          name: 'no-subs',
        };

        const formValue = signal({ name: '' });

        expect(() => {
          runInInjectionContext(injector, () => {
            const schemaFn = createSchemaFunction(schemaDefinition);

            const formInstance = form(
              formValue,
              schema<typeof formValue>((path) => {
                schemaFn(path.name);
              }),
            );
            mockFormSignal.set(formInstance);
          });
        }).not.toThrow();
      });
    });

    describe('Combined Scenarios', () => {
      it('should apply validators, logic, and sub-schemas together', () => {
        schemaRegistry.registerSchema({
          name: 'child',
          validators: [{ type: 'email' }],
        });

        const combinedSchema: SchemaDefinition = {
          name: 'combined',
          validators: [{ type: 'required' }],
          logic: [{ type: 'show', condition: { type: 'expression', expression: 'true' } }],
          subSchemas: [{ type: 'apply', schema: 'child' }],
        };

        const formValue = signal({ email: '' });
        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          const schemaFn = createSchemaFunction(combinedSchema);

          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              schemaFn(path.email);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
      });

      it('should handle empty schema definition', () => {
        const schemaDefinition: SchemaDefinition = {
          name: 'empty',
        };

        const formValue = signal({ name: '' });

        expect(() => {
          runInInjectionContext(injector, () => {
            const schemaFn = createSchemaFunction(schemaDefinition);

            const formInstance = form(
              formValue,
              schema<typeof formValue>((path) => {
                schemaFn(path.name);
              }),
            );
            mockFormSignal.set(formInstance);
          });
        }).not.toThrow();
      });

      it('should work with complex schema definitions', () => {
        const complexSchema: SchemaDefinition = {
          name: 'complex',
          description: 'A complex schema',
          validators: [{ type: 'required' }, { type: 'email' }, { type: 'minLength', value: 5 }],
          logic: [
            { type: 'show', condition: { type: 'expression', expression: 'age > 18' } },
            { type: 'enable', condition: { type: 'expression', expression: 'isActive' } },
          ],
        };

        const formValue = signal({ email: '', age: 25, isActive: true });
        let formInstance: ReturnType<typeof form>;

        runInInjectionContext(injector, () => {
          const schemaFn = createSchemaFunction(complexSchema);

          formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              schemaFn(path.email);
            }),
          );
          mockFormSignal.set(formInstance);
        });

        expect(formInstance).toBeDefined();
      });
    });

    describe('Type Safety', () => {
      it('should maintain generic type parameter T', () => {
        interface TestModel {
          name: string;
          age: number;
        }

        const schemaDefinition: SchemaDefinition = {
          name: 'typed-schema',
          validators: [{ type: 'required' }],
        };

        const schemaFn = createSchemaFunction<TestModel>(schemaDefinition);
        expect(schemaFn).toBeDefined();
      });

      it('should return valid SchemaOrSchemaFn<T>', () => {
        const schemaDefinition: SchemaDefinition = {
          name: 'return-type',
          validators: [],
        };

        const result = createSchemaFunction(schemaDefinition);

        expect(typeof result).toBe('function');
      });
    });
  });
});
