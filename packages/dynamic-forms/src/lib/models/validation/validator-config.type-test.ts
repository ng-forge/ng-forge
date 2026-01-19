/**
 * Exhaustive type tests for ValidatorConfig types.
 */
import { expectTypeOf } from 'vitest';
import type { ConditionalExpression } from '../expressions/conditional-expression';
import type { RequiredKeys, OptionalKeys } from '@ng-forge/utils';
import type {
  BaseValidatorConfig,
  BuiltInValidatorConfig,
  CustomValidatorConfig,
  AsyncValidatorConfig,
  HttpValidatorConfig,
  ValidatorConfig,
} from './validator-config';

// ============================================================================
// BaseValidatorConfig - Whitelist Test
// ============================================================================

describe('BaseValidatorConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'when';
  type ActualKeys = keyof BaseValidatorConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have when as optional', () => {
    expectTypeOf<RequiredKeys<BaseValidatorConfig>>().toEqualTypeOf<never>();
    expectTypeOf<OptionalKeys<BaseValidatorConfig>>().toEqualTypeOf<'when'>();
  });

  it('when should be ConditionalExpression', () => {
    expectTypeOf<BaseValidatorConfig['when']>().toEqualTypeOf<ConditionalExpression | undefined>();
  });
});

// ============================================================================
// BuiltInValidatorConfig - Whitelist Test
// ============================================================================

describe('BuiltInValidatorConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type' | 'value' | 'expression' | 'when';
  type ActualKeys = keyof BuiltInValidatorConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('should have type as required', () => {
      expectTypeOf<RequiredKeys<BuiltInValidatorConfig>>().toEqualTypeOf<'type'>();
    });
  });

  describe('optional keys', () => {
    it('should have value, expression, and when as optional', () => {
      expectTypeOf<OptionalKeys<BuiltInValidatorConfig>>().toMatchTypeOf<'value' | 'expression' | 'when'>();
    });
  });

  describe('property types', () => {
    it('type should be built-in validator names', () => {
      expectTypeOf<BuiltInValidatorConfig['type']>().toEqualTypeOf<
        'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern'
      >();
    });

    it('value should be number, string, or RegExp', () => {
      expectTypeOf<BuiltInValidatorConfig['value']>().toEqualTypeOf<number | string | RegExp | undefined>();
    });

    it('expression should be string', () => {
      expectTypeOf<BuiltInValidatorConfig['expression']>().toEqualTypeOf<string | undefined>();
    });

    it('when should be ConditionalExpression', () => {
      expectTypeOf<BuiltInValidatorConfig['when']>().toEqualTypeOf<ConditionalExpression | undefined>();
    });
  });
});

// ============================================================================
// CustomValidatorConfig - Whitelist Test
// ============================================================================

describe('CustomValidatorConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type' | 'functionName' | 'params' | 'expression' | 'kind' | 'errorParams' | 'when';
  type ActualKeys = keyof CustomValidatorConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('should have type as required', () => {
      expectTypeOf<RequiredKeys<CustomValidatorConfig>>().toEqualTypeOf<'type'>();
    });
  });

  describe('property types', () => {
    it('type should be literal custom', () => {
      expectTypeOf<CustomValidatorConfig['type']>().toEqualTypeOf<'custom'>();
    });

    it('functionName should be string', () => {
      expectTypeOf<CustomValidatorConfig['functionName']>().toEqualTypeOf<string | undefined>();
    });

    it('params should be Record<string, unknown>', () => {
      expectTypeOf<CustomValidatorConfig['params']>().toEqualTypeOf<Record<string, unknown> | undefined>();
    });

    it('expression should be string', () => {
      expectTypeOf<CustomValidatorConfig['expression']>().toEqualTypeOf<string | undefined>();
    });

    it('kind should be string', () => {
      expectTypeOf<CustomValidatorConfig['kind']>().toEqualTypeOf<string | undefined>();
    });

    it('errorParams should be Record<string, string>', () => {
      expectTypeOf<CustomValidatorConfig['errorParams']>().toEqualTypeOf<Record<string, string> | undefined>();
    });

    it('when should be ConditionalExpression', () => {
      expectTypeOf<CustomValidatorConfig['when']>().toEqualTypeOf<ConditionalExpression | undefined>();
    });
  });
});

// ============================================================================
// AsyncValidatorConfig - Whitelist Test
// ============================================================================

describe('AsyncValidatorConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type' | 'functionName' | 'params' | 'when';
  type ActualKeys = keyof AsyncValidatorConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('should have type and functionName as required', () => {
      expectTypeOf<RequiredKeys<AsyncValidatorConfig>>().toEqualTypeOf<'type' | 'functionName'>();
    });
  });

  describe('property types', () => {
    it('type should be literal customAsync', () => {
      expectTypeOf<AsyncValidatorConfig['type']>().toEqualTypeOf<'customAsync'>();
    });

    it('functionName should be string', () => {
      expectTypeOf<AsyncValidatorConfig['functionName']>().toEqualTypeOf<string>();
    });

    it('params should be Record<string, unknown>', () => {
      expectTypeOf<AsyncValidatorConfig['params']>().toEqualTypeOf<Record<string, unknown> | undefined>();
    });

    it('when should be ConditionalExpression', () => {
      expectTypeOf<AsyncValidatorConfig['when']>().toEqualTypeOf<ConditionalExpression | undefined>();
    });
  });
});

// ============================================================================
// HttpValidatorConfig - Whitelist Test
// ============================================================================

describe('HttpValidatorConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type' | 'functionName' | 'params' | 'when';
  type ActualKeys = keyof HttpValidatorConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('should have type and functionName as required', () => {
      expectTypeOf<RequiredKeys<HttpValidatorConfig>>().toEqualTypeOf<'type' | 'functionName'>();
    });
  });

  describe('property types', () => {
    it('type should be literal customHttp', () => {
      expectTypeOf<HttpValidatorConfig['type']>().toEqualTypeOf<'customHttp'>();
    });

    it('functionName should be string', () => {
      expectTypeOf<HttpValidatorConfig['functionName']>().toEqualTypeOf<string>();
    });

    it('params should be Record<string, unknown>', () => {
      expectTypeOf<HttpValidatorConfig['params']>().toEqualTypeOf<Record<string, unknown> | undefined>();
    });

    it('when should be ConditionalExpression', () => {
      expectTypeOf<HttpValidatorConfig['when']>().toEqualTypeOf<ConditionalExpression | undefined>();
    });
  });
});

// ============================================================================
// ValidatorConfig - Discriminated Union
// ============================================================================

describe('ValidatorConfig - Discriminated Union', () => {
  it('should be union of all validator config types', () => {
    type ExpectedUnion = BuiltInValidatorConfig | CustomValidatorConfig | AsyncValidatorConfig | HttpValidatorConfig;
    expectTypeOf<ValidatorConfig>().toEqualTypeOf<ExpectedUnion>();
  });

  it('should accept BuiltInValidatorConfig', () => {
    expectTypeOf<BuiltInValidatorConfig>().toMatchTypeOf<ValidatorConfig>();
  });

  it('should accept CustomValidatorConfig', () => {
    expectTypeOf<CustomValidatorConfig>().toMatchTypeOf<ValidatorConfig>();
  });

  it('should accept AsyncValidatorConfig', () => {
    expectTypeOf<AsyncValidatorConfig>().toMatchTypeOf<ValidatorConfig>();
  });

  it('should accept HttpValidatorConfig', () => {
    expectTypeOf<HttpValidatorConfig>().toMatchTypeOf<ValidatorConfig>();
  });
});

// ============================================================================
// BuiltInValidatorConfig - Usage Examples
// ============================================================================

describe('BuiltInValidatorConfig - Usage Examples', () => {
  it('should accept required validator', () => {
    const validator = {
      type: 'required',
    } as const satisfies BuiltInValidatorConfig;

    expectTypeOf(validator.type).toEqualTypeOf<'required'>();
  });

  it('should accept email validator', () => {
    const validator = {
      type: 'email',
    } as const satisfies BuiltInValidatorConfig;

    expectTypeOf(validator.type).toEqualTypeOf<'email'>();
  });

  it('should accept min validator with value', () => {
    const validator = {
      type: 'min',
      value: 0,
    } as const satisfies BuiltInValidatorConfig;

    expectTypeOf(validator.value).toEqualTypeOf<0>();
  });

  it('should accept max validator with value', () => {
    const validator = {
      type: 'max',
      value: 100,
    } as const satisfies BuiltInValidatorConfig;

    expectTypeOf(validator.value).toEqualTypeOf<100>();
  });

  it('should accept minLength validator with value', () => {
    const validator = {
      type: 'minLength',
      value: 3,
    } as const satisfies BuiltInValidatorConfig;

    expectTypeOf(validator.value).toEqualTypeOf<3>();
  });

  it('should accept maxLength validator with value', () => {
    const validator = {
      type: 'maxLength',
      value: 50,
    } as const satisfies BuiltInValidatorConfig;

    expectTypeOf(validator.value).toEqualTypeOf<50>();
  });

  it('should accept pattern validator with string value', () => {
    const validator = {
      type: 'pattern',
      value: '^[A-Za-z]+$',
    } as const satisfies BuiltInValidatorConfig;

    expectTypeOf(validator.value).toEqualTypeOf<'^[A-Za-z]+$'>();
  });

  it('should accept pattern validator with RegExp value', () => {
    const validator: BuiltInValidatorConfig = {
      type: 'pattern',
      value: /^[A-Za-z]+$/,
    };

    expectTypeOf(validator).toMatchTypeOf<BuiltInValidatorConfig>();
  });

  it('should accept validator with expression', () => {
    const validator = {
      type: 'min',
      expression: 'formValue.minValue',
    } as const satisfies BuiltInValidatorConfig;

    expectTypeOf(validator.expression).toEqualTypeOf<'formValue.minValue'>();
  });

  it('should accept validator with when condition', () => {
    const validator = {
      type: 'required',
      when: {
        type: 'fieldValue',
        fieldPath: 'useEmail',
        operator: 'equals',
        value: true,
      },
    } as const satisfies BuiltInValidatorConfig;

    expectTypeOf(validator.when).toMatchTypeOf<ConditionalExpression>();
  });
});

// ============================================================================
// CustomValidatorConfig - Usage Examples
// ============================================================================

describe('CustomValidatorConfig - Usage Examples', () => {
  it('should accept function-based custom validator', () => {
    const validator = {
      type: 'custom',
      functionName: 'passwordStrength',
      params: {
        minStrength: 3,
      },
    } as const satisfies CustomValidatorConfig;

    expectTypeOf(validator.type).toEqualTypeOf<'custom'>();
    expectTypeOf(validator.functionName).toEqualTypeOf<'passwordStrength'>();
  });

  it('should accept expression-based custom validator', () => {
    const validator = {
      type: 'custom',
      expression: 'fieldValue === formValue.confirmPassword',
      kind: 'passwordMismatch',
    } as const satisfies CustomValidatorConfig;

    expectTypeOf(validator.expression).toEqualTypeOf<'fieldValue === formValue.confirmPassword'>();
    expectTypeOf(validator.kind).toEqualTypeOf<'passwordMismatch'>();
  });

  it('should accept custom validator with error params', () => {
    const validator = {
      type: 'custom',
      expression: 'fieldValue >= formValue.min && fieldValue <= formValue.max',
      kind: 'range',
      errorParams: {
        min: 'formValue.min',
        max: 'formValue.max',
      },
    } as const satisfies CustomValidatorConfig;

    expectTypeOf(validator.errorParams).toMatchTypeOf<Record<string, string>>();
  });

  it('should accept custom validator with when condition', () => {
    const validator = {
      type: 'custom',
      functionName: 'uniqueUsername',
      when: {
        type: 'fieldValue',
        fieldPath: 'accountType',
        operator: 'equals',
        value: 'premium',
      },
    } as const satisfies CustomValidatorConfig;

    expectTypeOf(validator.when).toMatchTypeOf<ConditionalExpression>();
  });
});

// ============================================================================
// AsyncValidatorConfig - Usage Examples
// ============================================================================

describe('AsyncValidatorConfig - Usage Examples', () => {
  it('should accept async validator without params', () => {
    const validator = {
      type: 'customAsync',
      functionName: 'checkEmailAvailability',
    } as const satisfies AsyncValidatorConfig;

    expectTypeOf(validator.type).toEqualTypeOf<'customAsync'>();
    expectTypeOf(validator.functionName).toEqualTypeOf<'checkEmailAvailability'>();
  });

  it('should accept async validator with params', () => {
    const validator = {
      type: 'customAsync',
      functionName: 'validateDomain',
      params: {
        allowedDomains: ['example.com', 'test.com'],
      },
    } as const satisfies AsyncValidatorConfig;

    expectTypeOf(validator.params).toMatchTypeOf<Record<string, unknown>>();
  });

  it('should accept async validator with when condition', () => {
    const validator = {
      type: 'customAsync',
      functionName: 'checkInventory',
      when: {
        type: 'fieldValue',
        fieldPath: 'checkStock',
        operator: 'equals',
        value: true,
      },
    } as const satisfies AsyncValidatorConfig;

    expectTypeOf(validator.when).toMatchTypeOf<ConditionalExpression>();
  });
});

// ============================================================================
// HttpValidatorConfig - Usage Examples
// ============================================================================

describe('HttpValidatorConfig - Usage Examples', () => {
  it('should accept http validator without params', () => {
    const validator = {
      type: 'customHttp',
      functionName: 'validateUsername',
    } as const satisfies HttpValidatorConfig;

    expectTypeOf(validator.type).toEqualTypeOf<'customHttp'>();
    expectTypeOf(validator.functionName).toEqualTypeOf<'validateUsername'>();
  });

  it('should accept http validator with params', () => {
    const validator = {
      type: 'customHttp',
      functionName: 'checkAvailability',
      params: {
        endpoint: '/api/check',
        timeout: 3000,
      },
    } as const satisfies HttpValidatorConfig;

    expectTypeOf(validator.params).toMatchTypeOf<Record<string, unknown>>();
  });

  it('should accept http validator with when condition', () => {
    const validator = {
      type: 'customHttp',
      functionName: 'validateCode',
      when: {
        type: 'fieldValue',
        fieldPath: 'usePromoCode',
        operator: 'equals',
        value: true,
      },
    } as const satisfies HttpValidatorConfig;

    expectTypeOf(validator.when).toMatchTypeOf<ConditionalExpression>();
  });
});

// ============================================================================
// ValidatorConfig - Array Usage
// ============================================================================

describe('ValidatorConfig - Array Usage', () => {
  it('should accept array of mixed validator types', () => {
    const validators = [
      { type: 'required' },
      { type: 'email' },
      { type: 'minLength', value: 5 },
      { type: 'custom', functionName: 'passwordStrength' },
      { type: 'customAsync', functionName: 'checkEmailAvailability' },
      { type: 'customHttp', functionName: 'validateDomain' },
    ] as const satisfies ValidatorConfig[];

    expectTypeOf(validators).toMatchTypeOf<readonly ValidatorConfig[]>();
  });
});
