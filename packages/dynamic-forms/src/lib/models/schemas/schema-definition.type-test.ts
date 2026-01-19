/**
 * Exhaustive type tests for SchemaApplicationConfig and SchemaDefinition interfaces.
 */
import { expectTypeOf } from 'vitest';
import type { ValidatorConfig } from '../validation/validator-config';
import type { LogicConfig } from '../logic/logic-config';
import type { ConditionalExpression } from '../expressions/conditional-expression';
import type { SchemaApplicationConfig, SchemaDefinition } from './schema-definition';
import type { RequiredKeys, OptionalKeys } from '@ng-forge/utils';

// ============================================================================
// SchemaApplicationConfig - Whitelist Test
// ============================================================================

describe('SchemaApplicationConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type' | 'schema' | 'condition' | 'typePredicate';
  type ActualKeys = keyof SchemaApplicationConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('should have type and schema as required', () => {
      expectTypeOf<RequiredKeys<SchemaApplicationConfig>>().toEqualTypeOf<'type' | 'schema'>();
    });
  });

  describe('optional keys', () => {
    it('should have condition and typePredicate as optional', () => {
      expectTypeOf<OptionalKeys<SchemaApplicationConfig>>().toMatchTypeOf<'condition' | 'typePredicate'>();
    });
  });
});

// ============================================================================
// SchemaApplicationConfig - Property Types
// ============================================================================

describe('SchemaApplicationConfig - Property Types', () => {
  it('type should be literal union', () => {
    expectTypeOf<SchemaApplicationConfig['type']>().toEqualTypeOf<'apply' | 'applyWhen' | 'applyWhenValue' | 'applyEach'>();
  });

  it('schema should be string or SchemaDefinition', () => {
    expectTypeOf<SchemaApplicationConfig['schema']>().toEqualTypeOf<string | SchemaDefinition>();
  });

  it('condition should be ConditionalExpression', () => {
    expectTypeOf<SchemaApplicationConfig['condition']>().toEqualTypeOf<ConditionalExpression | undefined>();
  });

  it('typePredicate should be string', () => {
    expectTypeOf<SchemaApplicationConfig['typePredicate']>().toEqualTypeOf<string | undefined>();
  });
});

// ============================================================================
// SchemaDefinition - Whitelist Test
// ============================================================================

describe('SchemaDefinition - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'name' | 'description' | 'pathPattern' | 'validators' | 'logic' | 'subSchemas';
  type ActualKeys = keyof SchemaDefinition;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('should have name as required', () => {
      expectTypeOf<RequiredKeys<SchemaDefinition>>().toEqualTypeOf<'name'>();
    });
  });

  describe('optional keys', () => {
    it('should have all other keys as optional', () => {
      expectTypeOf<OptionalKeys<SchemaDefinition>>().toMatchTypeOf<'description' | 'pathPattern' | 'validators' | 'logic' | 'subSchemas'>();
    });
  });
});

// ============================================================================
// SchemaDefinition - Property Types
// ============================================================================

describe('SchemaDefinition - Property Types', () => {
  it('name should be string', () => {
    expectTypeOf<SchemaDefinition['name']>().toEqualTypeOf<string>();
  });

  it('description should be string', () => {
    expectTypeOf<SchemaDefinition['description']>().toEqualTypeOf<string | undefined>();
  });

  it('pathPattern should be string', () => {
    expectTypeOf<SchemaDefinition['pathPattern']>().toEqualTypeOf<string | undefined>();
  });

  it('validators should be ValidatorConfig array', () => {
    expectTypeOf<SchemaDefinition['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
  });

  it('logic should be LogicConfig array', () => {
    expectTypeOf<SchemaDefinition['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
  });

  it('subSchemas should be SchemaApplicationConfig array', () => {
    expectTypeOf<SchemaDefinition['subSchemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
  });
});

// ============================================================================
// SchemaApplicationConfig - Usage Examples
// ============================================================================

describe('SchemaApplicationConfig - Usage Examples', () => {
  it('should accept apply type with string schema', () => {
    const config = {
      type: 'apply',
      schema: 'email-validation',
    } as const satisfies SchemaApplicationConfig;

    expectTypeOf(config.type).toEqualTypeOf<'apply'>();
    expectTypeOf(config.schema).toEqualTypeOf<'email-validation'>();
  });

  it('should accept apply type with inline schema', () => {
    const config = {
      type: 'apply',
      schema: {
        name: 'password-rules',
        validators: [
          { type: 'minLength', value: 8 },
          { type: 'pattern', value: '^(?=.*[A-Za-z])(?=.*\\d)' },
        ],
      },
    } as const satisfies SchemaApplicationConfig;

    expectTypeOf(config.schema).toMatchTypeOf<SchemaDefinition>();
  });

  it('should accept applyWhen type with condition', () => {
    const config = {
      type: 'applyWhen',
      schema: 'professional-email',
      condition: {
        type: 'fieldValue',
        fieldPath: 'accountType',
        operator: 'equals',
        value: 'business',
      },
    } as const satisfies SchemaApplicationConfig;

    expectTypeOf(config.type).toEqualTypeOf<'applyWhen'>();
    expectTypeOf(config.condition).toMatchTypeOf<ConditionalExpression>();
  });

  it('should accept applyWhenValue type with typePredicate', () => {
    const config = {
      type: 'applyWhenValue',
      schema: 'number-validation',
      typePredicate: 'typeof value === "number"',
    } as const satisfies SchemaApplicationConfig;

    expectTypeOf(config.type).toEqualTypeOf<'applyWhenValue'>();
    expectTypeOf(config.typePredicate).toEqualTypeOf<'typeof value === "number"'>();
  });

  it('should accept applyEach type for array validation', () => {
    const config = {
      type: 'applyEach',
      schema: 'item-validation',
    } as const satisfies SchemaApplicationConfig;

    expectTypeOf(config.type).toEqualTypeOf<'applyEach'>();
  });
});

// ============================================================================
// SchemaDefinition - Usage Examples
// ============================================================================

describe('SchemaDefinition - Usage Examples', () => {
  it('should accept minimal schema definition', () => {
    const schema = {
      name: 'basic-schema',
    } as const satisfies SchemaDefinition;

    expectTypeOf(schema.name).toEqualTypeOf<'basic-schema'>();
  });

  it('should accept schema with description', () => {
    const schema = {
      name: 'email-validation',
      description: 'Standard email validation rules',
    } as const satisfies SchemaDefinition;

    expectTypeOf(schema.description).toEqualTypeOf<'Standard email validation rules'>();
  });

  it('should accept schema with path pattern', () => {
    const schema = {
      name: 'address-schema',
      pathPattern: 'address.*',
    } as const satisfies SchemaDefinition;

    expectTypeOf(schema.pathPattern).toEqualTypeOf<'address.*'>();
  });

  it('should accept schema with validators', () => {
    const schema = {
      name: 'password-schema',
      validators: [
        { type: 'required' },
        { type: 'minLength', value: 8 },
        { type: 'maxLength', value: 100 },
        { type: 'pattern', value: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)' },
      ],
    } as const satisfies SchemaDefinition;

    expectTypeOf(schema.validators).toMatchTypeOf<ValidatorConfig[]>();
  });

  it('should accept schema with logic rules', () => {
    const schema = {
      name: 'conditional-schema',
      logic: [
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'useEmail',
            operator: 'equals',
            value: true,
          },
        },
      ],
    } as const satisfies SchemaDefinition;

    expectTypeOf(schema.logic).toMatchTypeOf<LogicConfig[]>();
  });

  it('should accept schema with sub-schemas', () => {
    const schema = {
      name: 'composite-schema',
      subSchemas: [
        {
          type: 'apply',
          schema: 'base-validation',
        },
        {
          type: 'applyWhen',
          schema: 'premium-validation',
          condition: {
            type: 'fieldValue',
            fieldPath: 'isPremium',
            operator: 'equals',
            value: true,
          },
        },
      ],
    } as const satisfies SchemaDefinition;

    expectTypeOf(schema.subSchemas).toMatchTypeOf<SchemaApplicationConfig[]>();
  });

  it('should accept complete schema definition', () => {
    const schema = {
      name: 'complete-schema',
      description: 'Comprehensive validation schema',
      pathPattern: 'user.profile.*',
      validators: [{ type: 'required' }, { type: 'minLength', value: 3 }],
      logic: [
        {
          type: 'required',
          condition: true,
        },
      ],
      subSchemas: [
        {
          type: 'apply',
          schema: 'base-rules',
        },
      ],
    } as const satisfies SchemaDefinition;

    expectTypeOf(schema).toMatchTypeOf<SchemaDefinition>();
  });
});

// ============================================================================
// SchemaApplicationConfig - Complex Scenarios
// ============================================================================

describe('SchemaApplicationConfig - Complex Scenarios', () => {
  it('should accept array of schema applications', () => {
    const schemas = [
      {
        type: 'apply',
        schema: 'required-fields',
      },
      {
        type: 'applyWhen',
        schema: 'email-validation',
        condition: {
          type: 'fieldValue',
          fieldPath: 'contactMethod',
          operator: 'equals',
          value: 'email',
        },
      },
      {
        type: 'applyEach',
        schema: {
          name: 'item-validation',
          validators: [{ type: 'required' }],
        },
      },
    ] as const satisfies SchemaApplicationConfig[];

    expectTypeOf(schemas).toMatchTypeOf<readonly SchemaApplicationConfig[]>();
  });

  it('should accept nested inline schema definitions', () => {
    const config = {
      type: 'apply',
      schema: {
        name: 'parent-schema',
        subSchemas: [
          {
            type: 'apply',
            schema: {
              name: 'nested-schema',
              validators: [{ type: 'email' }],
            },
          },
        ],
      },
    } as const satisfies SchemaApplicationConfig;

    expectTypeOf(config).toMatchTypeOf<SchemaApplicationConfig>();
  });
});

// ============================================================================
// SchemaDefinition - Recursive Schema Validation
// ============================================================================

describe('SchemaDefinition - Recursive Schemas', () => {
  it('should support nested schema applications', () => {
    const schema: SchemaDefinition = {
      name: 'parent',
      subSchemas: [
        {
          type: 'apply',
          schema: {
            name: 'child',
            subSchemas: [
              {
                type: 'apply',
                schema: 'grandchild',
              },
            ],
          },
        },
      ],
    };

    expectTypeOf(schema).toMatchTypeOf<SchemaDefinition>();
  });

  it('should support complex validation scenarios', () => {
    const schema: SchemaDefinition = {
      name: 'user-registration',
      description: 'Validation schema for user registration',
      validators: [{ type: 'required' }, { type: 'email' }],
      logic: [
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'acceptTerms',
            operator: 'equals',
            value: true,
          },
        },
      ],
      subSchemas: [
        {
          type: 'applyWhen',
          schema: 'age-verification',
          condition: {
            type: 'fieldValue',
            fieldPath: 'requiresAgeVerification',
            operator: 'equals',
            value: true,
          },
        },
        {
          type: 'apply',
          schema: {
            name: 'password-strength',
            validators: [
              { type: 'minLength', value: 8 },
              { type: 'custom', functionName: 'passwordStrength' },
            ],
          },
        },
      ],
    };

    expectTypeOf(schema).toMatchTypeOf<SchemaDefinition>();
  });
});

// ============================================================================
// Schema Type Discrimination
// ============================================================================

describe('Schema Type Discrimination', () => {
  it('should distinguish between schema application types', () => {
    const applyConfig: SchemaApplicationConfig = {
      type: 'apply',
      schema: 'test',
    };

    const applyWhenConfig: SchemaApplicationConfig = {
      type: 'applyWhen',
      schema: 'test',
      condition: {
        type: 'fieldValue',
        fieldPath: 'test',
        operator: 'equals',
        value: true,
      },
    };

    const applyWhenValueConfig: SchemaApplicationConfig = {
      type: 'applyWhenValue',
      schema: 'test',
      typePredicate: 'test',
    };

    const applyEachConfig: SchemaApplicationConfig = {
      type: 'applyEach',
      schema: 'test',
    };

    expectTypeOf(applyConfig).toMatchTypeOf<SchemaApplicationConfig>();
    expectTypeOf(applyWhenConfig).toMatchTypeOf<SchemaApplicationConfig>();
    expectTypeOf(applyWhenValueConfig).toMatchTypeOf<SchemaApplicationConfig>();
    expectTypeOf(applyEachConfig).toMatchTypeOf<SchemaApplicationConfig>();
  });
});
