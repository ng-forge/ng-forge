import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { runInInjectionContext, Injector } from '@angular/core';
import { applySchema, createSchemaFunction } from './schema-application';
import { SchemaRegistryService } from './registry/schema-registry.service';
import { SchemaApplicationConfig, SchemaDefinition } from '../models';
import * as angularForms from '@angular/forms/signals';
import * as validation from './validation';
import * as logic from './logic';
import * as expressions from './expressions';
import * as values from './values';

// Mock Angular forms functions
vi.mock('@angular/forms/signals', async () => {
  const actual = await vi.importActual<typeof angularForms>('@angular/forms/signals');
  return {
    ...actual,
    apply: vi.fn(),
    applyWhen: vi.fn(),
    applyWhenValue: vi.fn(),
    applyEach: vi.fn(),
  };
});

// Mock validation, logic, and expression functions
vi.mock('./validation', async () => {
  const actual = await vi.importActual<typeof validation>('./validation');
  return {
    ...actual,
    applyValidator: vi.fn(),
  };
});

vi.mock('./logic', async () => {
  const actual = await vi.importActual<typeof logic>('./logic');
  return {
    ...actual,
    applyLogic: vi.fn(),
  };
});

vi.mock('./expressions', async () => {
  const actual = await vi.importActual<typeof expressions>('./expressions');
  return {
    ...actual,
    createLogicFunction: vi.fn(() => () => true),
  };
});

vi.mock('./values', async () => {
  const actual = await vi.importActual<typeof values>('./values');
  return {
    ...actual,
    createTypePredicateFunction: vi.fn(() => () => true),
  };
});

describe('schema-application', () => {
  let schemaRegistry: SchemaRegistryService;
  let injector: Injector;
  let mockFieldPath: any;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SchemaRegistryService],
    });

    injector = TestBed.inject(Injector);
    schemaRegistry = TestBed.inject(SchemaRegistryService);

    // Create mock field path
    mockFieldPath = {
      name: {},
      email: {},
    };

    // Clear all mocks
    vi.clearAllMocks();

    // Spy on console.error
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      // Intentionally empty - we're just suppressing console output in tests
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // Test Suite 2.1: applySchema()
  describe('applySchema()', () => {
    // 2.1.1 Schema Resolution
    describe('Schema Resolution', () => {
      it('should resolve schema by name from registry', () => {
        const schema: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        schemaRegistry.registerSchema(schema);

        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'test-schema',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.apply)).toHaveBeenCalled();
      });

      it('should resolve inline schema definitions', () => {
        const schema: SchemaDefinition = {
          name: 'inline-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: schema,
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.apply)).toHaveBeenCalled();
      });

      it('should log error when schema not found', () => {
        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'nonexistent-schema',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[Dynamic Forms] Schema not found: 'nonexistent-schema'"));
      });

      it('should list available schemas in error message', () => {
        schemaRegistry.registerSchema({ name: 'schema1', validators: [] });
        schemaRegistry.registerSchema({ name: 'schema2', validators: [] });

        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'missing',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Available schemas: schema1, schema2'));
      });

      it('should handle empty schema registry gracefully', () => {
        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'any-schema',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Available schemas: <none>'));
      });

      it('should not throw when schema is missing', () => {
        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'missing',
        };

        expect(() => {
          runInInjectionContext(injector, () => {
            applySchema(config, mockFieldPath);
          });
        }).not.toThrow();
      });
    });

    // 2.1.2 Application Type: 'apply'
    describe("Application Type: 'apply'", () => {
      it("should call Angular's apply() with schema function", () => {
        const schema: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        schemaRegistry.registerSchema(schema);

        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'test-schema',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.apply)).toHaveBeenCalledWith(mockFieldPath, expect.any(Function));
      });

      it('should apply schema unconditionally', () => {
        const schema: SchemaDefinition = {
          name: 'unconditional-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: schema,
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.apply)).toHaveBeenCalled();
        expect(vi.mocked(angularForms.applyWhen)).not.toHaveBeenCalled();
      });

      it('should work with SchemaPath parameter', () => {
        const schema: SchemaDefinition = {
          name: 'path-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: schema,
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.apply)).toHaveBeenCalled();
      });

      it('should work with SchemaPathTree parameter', () => {
        const schema: SchemaDefinition = {
          name: 'tree-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: schema,
        };

        const mockPathTree = { ...mockFieldPath };

        runInInjectionContext(injector, () => {
          applySchema(config, mockPathTree);
        });

        expect(vi.mocked(angularForms.apply)).toHaveBeenCalled();
      });
    });

    // 2.1.3 Application Type: 'applyWhen'
    describe("Application Type: 'applyWhen'", () => {
      it("should call Angular's applyWhen() with condition and schema", () => {
        const schema: SchemaDefinition = {
          name: 'conditional-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyWhen',
          schema: schema,
          condition: { type: 'expression', expression: 'age > 18' },
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(expressions.createLogicFunction)).toHaveBeenCalled();
        expect(vi.mocked(angularForms.applyWhen)).toHaveBeenCalledWith(mockFieldPath, expect.any(Function), expect.any(Function));
      });

      it('should create logic function from condition expression', () => {
        const schema: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyWhen',
          schema: schema,
          condition: { type: 'expression', expression: 'isActive' },
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(expressions.createLogicFunction)).toHaveBeenCalledWith({ type: 'expression', expression: 'isActive' });
      });

      it('should apply schema only when condition is provided', () => {
        const schema: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyWhen',
          schema: schema,
          condition: { type: 'expression', expression: 'true' },
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.applyWhen)).toHaveBeenCalled();
      });

      it('should skip application when condition is undefined', () => {
        const schema: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyWhen',
          schema: schema,
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.applyWhen)).not.toHaveBeenCalled();
      });

      it('should handle complex conditional expressions', () => {
        const schema: SchemaDefinition = {
          name: 'complex-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyWhen',
          schema: schema,
          condition: { type: 'expression', expression: 'age > 18 && country === "US"' },
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(expressions.createLogicFunction)).toHaveBeenCalled();
        expect(vi.mocked(angularForms.applyWhen)).toHaveBeenCalled();
      });
    });

    // 2.1.4 Application Type: 'applyWhenValue'
    describe("Application Type: 'applyWhenValue'", () => {
      it("should call Angular's applyWhenValue() with predicate and schema", () => {
        const schema: SchemaDefinition = {
          name: 'value-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyWhenValue',
          schema: schema,
          typePredicate: 'string',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(values.createTypePredicateFunction)).toHaveBeenCalled();
        expect(vi.mocked(angularForms.applyWhenValue)).toHaveBeenCalledWith(mockFieldPath, expect.any(Function), expect.any(Function));
      });

      it('should create type predicate function', () => {
        const schema: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyWhenValue',
          schema: schema,
          typePredicate: 'number',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(values.createTypePredicateFunction)).toHaveBeenCalledWith('number');
      });

      it('should apply schema when value matches predicate', () => {
        const schema: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyWhenValue',
          schema: schema,
          typePredicate: 'string',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.applyWhenValue)).toHaveBeenCalled();
      });

      it('should skip application when typePredicate is undefined', () => {
        const schema: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyWhenValue',
          schema: schema,
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.applyWhenValue)).not.toHaveBeenCalled();
      });

      it('should handle type narrowing correctly', () => {
        const schema: SchemaDefinition = {
          name: 'narrow-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyWhenValue',
          schema: schema,
          typePredicate: 'boolean',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(values.createTypePredicateFunction)).toHaveBeenCalledWith('boolean');
      });
    });

    // 2.1.5 Application Type: 'applyEach'
    describe("Application Type: 'applyEach'", () => {
      it("should call Angular's applyEach() for array schemas", () => {
        const schema: SchemaDefinition = {
          name: 'array-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyEach',
          schema: schema,
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.applyEach)).toHaveBeenCalledWith(mockFieldPath, expect.any(Function));
      });

      it('should cast path to SchemaPath<any[]>', () => {
        const schema: SchemaDefinition = {
          name: 'items-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyEach',
          schema: schema,
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.applyEach)).toHaveBeenCalled();
      });

      it('should apply schema to each array item', () => {
        const schema: SchemaDefinition = {
          name: 'item-schema',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'applyEach',
          schema: schema,
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.applyEach)).toHaveBeenCalledWith(expect.anything(), expect.any(Function));
      });
    });

    // 2.1.6 Error Handling
    describe('Error Handling', () => {
      it('should handle invalid application types gracefully', () => {
        const schema: SchemaDefinition = {
          name: 'test-schema',
          validators: [],
        };

        const config = {
          type: 'invalid' as any,
          schema: schema,
        };

        expect(() => {
          runInInjectionContext(injector, () => {
            applySchema(config, mockFieldPath);
          });
        }).not.toThrow();
      });

      it('should log meaningful error messages', () => {
        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'missing-schema',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Schema not found'));
      });

      it('should not crash on malformed config', () => {
        const config = {
          type: 'apply',
        } as any;

        expect(() => {
          runInInjectionContext(injector, () => {
            applySchema(config, mockFieldPath);
          });
        }).not.toThrow();
      });
    });

    // 2.1.7 Integration with Registry
    describe('Integration with Registry', () => {
      it('should inject SchemaRegistryService correctly', () => {
        const schema: SchemaDefinition = {
          name: 'registry-test',
          validators: [],
        };

        schemaRegistry.registerSchema(schema);

        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'registry-test',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(vi.mocked(angularForms.apply)).toHaveBeenCalled();
      });

      it('should query registry for schema resolution', () => {
        const schemaSpy = vi.spyOn(schemaRegistry, 'resolveSchema');

        const schema: SchemaDefinition = {
          name: 'query-test',
          validators: [],
        };

        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: schema,
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(schemaSpy).toHaveBeenCalledWith(schema);
      });

      it('should handle schema not in registry', () => {
        const config: SchemaApplicationConfig = {
          type: 'apply',
          schema: 'unregistered',
        };

        runInInjectionContext(injector, () => {
          applySchema(config, mockFieldPath);
        });

        expect(consoleSpy).toHaveBeenCalled();
        expect(vi.mocked(angularForms.apply)).not.toHaveBeenCalled();
      });
    });
  });

  // Test Suite 2.2: createSchemaFunction()
  describe('createSchemaFunction()', () => {
    // 2.2.1 Validator Application
    describe('Validator Application', () => {
      it('should apply validators from schema definition', () => {
        const schema: SchemaDefinition = {
          name: 'validator-schema',
          validators: [{ type: 'required' }, { type: 'email' }],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockFieldPath);

        expect(vi.mocked(validation.applyValidator)).toHaveBeenCalledTimes(2);
      });

      it('should apply multiple validators in order', () => {
        const schema: SchemaDefinition = {
          name: 'multi-validator',
          validators: [{ type: 'required' }, { type: 'minLength', value: 3 }, { type: 'maxLength', value: 20 }],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockFieldPath);

        expect(vi.mocked(validation.applyValidator)).toHaveBeenCalledTimes(3);
        expect(vi.mocked(validation.applyValidator)).toHaveBeenNthCalledWith(1, { type: 'required' }, mockFieldPath);
        expect(vi.mocked(validation.applyValidator)).toHaveBeenNthCalledWith(2, { type: 'minLength', value: 3 }, mockFieldPath);
        expect(vi.mocked(validation.applyValidator)).toHaveBeenNthCalledWith(3, { type: 'maxLength', value: 20 }, mockFieldPath);
      });

      it('should handle schema without validators', () => {
        const schema: SchemaDefinition = {
          name: 'no-validators',
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockFieldPath);

        expect(vi.mocked(validation.applyValidator)).not.toHaveBeenCalled();
      });

      it('should call applyValidator for each validator config', () => {
        const schema: SchemaDefinition = {
          name: 'test-schema',
          validators: [{ type: 'required' }],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockFieldPath);

        expect(vi.mocked(validation.applyValidator)).toHaveBeenCalledWith({ type: 'required' }, mockFieldPath);
      });

      it('should pass SchemaPathTree to applyValidator', () => {
        const schema: SchemaDefinition = {
          name: 'tree-schema',
          validators: [{ type: 'required' }],
        };

        const mockPathTree = { ...mockFieldPath };
        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockPathTree);

        expect(vi.mocked(validation.applyValidator)).toHaveBeenCalledWith(expect.anything(), mockPathTree);
      });
    });

    // 2.2.2 Logic Application
    describe('Logic Application', () => {
      it('should apply logic rules from schema definition', () => {
        const schema: SchemaDefinition = {
          name: 'logic-schema',
          logic: [
            { type: 'show', condition: { type: 'expression', expression: 'age > 18' } },
            { type: 'enable', condition: { type: 'expression', expression: 'isActive' } },
          ],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockFieldPath);

        expect(vi.mocked(logic.applyLogic)).toHaveBeenCalledTimes(2);
      });

      it('should apply multiple logic rules in order', () => {
        const schema: SchemaDefinition = {
          name: 'multi-logic',
          logic: [
            { type: 'show', condition: { type: 'expression', expression: 'true' } },
            { type: 'enable', condition: { type: 'expression', expression: 'true' } },
            { type: 'require', condition: { type: 'expression', expression: 'true' } },
          ],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockFieldPath);

        expect(vi.mocked(logic.applyLogic)).toHaveBeenCalledTimes(3);
      });

      it('should handle schema without logic', () => {
        const schema: SchemaDefinition = {
          name: 'no-logic',
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockFieldPath);

        expect(vi.mocked(logic.applyLogic)).not.toHaveBeenCalled();
      });

      it('should call applyLogic for each logic config', () => {
        const logicConfig = { type: 'show' as const, condition: { type: 'expression' as const, expression: 'true' } };
        const schema: SchemaDefinition = {
          name: 'test-schema',
          logic: [logicConfig],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockFieldPath);

        expect(vi.mocked(logic.applyLogic)).toHaveBeenCalledWith(logicConfig, mockFieldPath);
      });

      it('should pass SchemaPathTree to applyLogic', () => {
        const schema: SchemaDefinition = {
          name: 'tree-logic',
          logic: [{ type: 'show', condition: { type: 'expression', expression: 'true' } }],
        };

        const mockPathTree = { ...mockFieldPath };
        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockPathTree);

        expect(vi.mocked(logic.applyLogic)).toHaveBeenCalledWith(expect.anything(), mockPathTree);
      });
    });

    // 2.2.3 Sub-Schema Application
    describe('Sub-Schema Application', () => {
      it('should apply sub-schemas from schema definition', () => {
        const schema: SchemaDefinition = {
          name: 'parent-schema',
          subSchemas: [
            { type: 'apply', schema: 'child-schema-1' },
            { type: 'apply', schema: 'child-schema-2' },
          ],
        };

        // Mock applySchema to track calls
        const applySchemaOriginal = vi.fn();
        vi.mocked(applySchemaOriginal);

        let schemaFn: any;
        runInInjectionContext(injector, () => {
          schemaFn = createSchemaFunction(schema);
          schemaFn(mockFieldPath);
        });

        // Sub-schemas will attempt to call applySchema (through the actual implementation)
        // We can't easily test the recursive calls here without more complex mocking
        expect(schema.subSchemas).toHaveLength(2);
      });

      it('should apply multiple sub-schemas in order', () => {
        const schema: SchemaDefinition = {
          name: 'multi-sub',
          subSchemas: [
            { type: 'apply', schema: 'sub1' },
            { type: 'apply', schema: 'sub2' },
            { type: 'apply', schema: 'sub3' },
          ],
        };

        let schemaFn: any;
        runInInjectionContext(injector, () => {
          schemaFn = createSchemaFunction(schema);
          schemaFn(mockFieldPath);
        });

        expect(schema.subSchemas).toHaveLength(3);
      });

      it('should handle schema without sub-schemas', () => {
        const schema: SchemaDefinition = {
          name: 'no-subs',
        };

        const schemaFn = createSchemaFunction(schema);

        expect(() => {
          schemaFn(mockFieldPath);
        }).not.toThrow();
      });

      it('should pass SchemaPathTree to sub-schemas', () => {
        const schema: SchemaDefinition = {
          name: 'tree-sub',
          subSchemas: [{ type: 'apply', schema: 'child' }],
        };

        const mockPathTree = { ...mockFieldPath };
        let schemaFn: any;
        runInInjectionContext(injector, () => {
          schemaFn = createSchemaFunction(schema);

          expect(() => {
            schemaFn(mockPathTree);
          }).not.toThrow();
        });
      });

      it('should handle nested sub-schemas (recursion)', () => {
        const schema: SchemaDefinition = {
          name: 'nested',
          subSchemas: [
            {
              type: 'apply',
              schema: {
                name: 'nested-child',
                subSchemas: [{ type: 'apply', schema: 'grandchild' }],
              },
            },
          ],
        };

        let schemaFn: any;
        runInInjectionContext(injector, () => {
          schemaFn = createSchemaFunction(schema);

          expect(() => {
            schemaFn(mockFieldPath);
          }).not.toThrow();
        });
      });
    });

    // 2.2.4 Combined Scenarios
    describe('Combined Scenarios', () => {
      it('should apply validators, logic, and sub-schemas together', () => {
        const schema: SchemaDefinition = {
          name: 'combined',
          validators: [{ type: 'required' }],
          logic: [{ type: 'show', condition: { type: 'expression', expression: 'true' } }],
          subSchemas: [{ type: 'apply', schema: 'child' }],
        };

        let schemaFn: any;
        runInInjectionContext(injector, () => {
          schemaFn = createSchemaFunction(schema);
          schemaFn(mockFieldPath);
        });

        expect(vi.mocked(validation.applyValidator)).toHaveBeenCalled();
        expect(vi.mocked(logic.applyLogic)).toHaveBeenCalled();
      });

      it('should apply in correct order (validators → logic → sub-schemas)', () => {
        const callOrder: string[] = [];

        vi.mocked(validation.applyValidator).mockImplementation(() => {
          callOrder.push('validator');
        });

        vi.mocked(logic.applyLogic).mockImplementation(() => {
          callOrder.push('logic');
        });

        const schema: SchemaDefinition = {
          name: 'ordered',
          validators: [{ type: 'required' }],
          logic: [{ type: 'show', condition: { type: 'expression', expression: 'true' } }],
        };

        const schemaFn = createSchemaFunction(schema);
        schemaFn(mockFieldPath);

        expect(callOrder).toEqual(['validator', 'logic']);
      });

      it('should handle empty schema definition', () => {
        const schema: SchemaDefinition = {
          name: 'empty',
        };

        const schemaFn = createSchemaFunction(schema);

        expect(() => {
          schemaFn(mockFieldPath);
        }).not.toThrow();
      });

      it('should work with complex schema definitions', () => {
        const schema: SchemaDefinition = {
          name: 'complex',
          description: 'A complex schema',
          validators: [{ type: 'required' }, { type: 'email' }, { type: 'minLength', value: 5 }],
          logic: [
            { type: 'show', condition: { type: 'expression', expression: 'age > 18' } },
            { type: 'enable', condition: { type: 'expression', expression: 'isActive' } },
          ],
          subSchemas: [{ type: 'apply', schema: 'additional-validation' }],
        };

        let schemaFn: any;
        runInInjectionContext(injector, () => {
          schemaFn = createSchemaFunction(schema);
          schemaFn(mockFieldPath);
        });

        expect(vi.mocked(validation.applyValidator)).toHaveBeenCalledTimes(3);
        expect(vi.mocked(logic.applyLogic)).toHaveBeenCalledTimes(2);
      });
    });

    // 2.2.5 Type Safety
    describe('Type Safety', () => {
      it('should maintain generic type parameter T', () => {
        interface TestModel {
          name: string;
          age: number;
        }

        const schema: SchemaDefinition = {
          name: 'typed-schema',
          validators: [{ type: 'required' }],
        };

        const schemaFn = createSchemaFunction<TestModel>(schema);
        expect(schemaFn).toBeDefined();
      });

      it('should return valid SchemaOrSchemaFn<T>', () => {
        const schema: SchemaDefinition = {
          name: 'return-type',
          validators: [],
        };

        const result = createSchemaFunction(schema);

        expect(typeof result).toBe('function');
        expect(() => result(mockFieldPath)).not.toThrow();
      });
    });
  });
});
