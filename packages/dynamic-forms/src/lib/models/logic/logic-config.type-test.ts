/**
 * Exhaustive type tests for LogicConfig interface.
 */
import { expectTypeOf } from 'vitest';
import type { ConditionalExpression } from '../expressions/conditional-expression';
import type {
  LogicConfig,
  FormStateCondition,
  StateLogicConfig,
  DerivationLogicConfig,
  DerivationTrigger,
  PropertyDerivationLogicConfig,
} from './logic-config';
import { isFormStateCondition } from './logic-config';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// FormStateCondition - Type Tests
// ============================================================================

describe('FormStateCondition - Type Tests', () => {
  it('should be a union of specific strings', () => {
    expectTypeOf<FormStateCondition>().toEqualTypeOf<'formInvalid' | 'formSubmitting' | 'pageInvalid'>();
  });

  it('should accept formInvalid', () => {
    const condition: FormStateCondition = 'formInvalid';
    expectTypeOf(condition).toMatchTypeOf<FormStateCondition>();
  });

  it('should accept formSubmitting', () => {
    const condition: FormStateCondition = 'formSubmitting';
    expectTypeOf(condition).toMatchTypeOf<FormStateCondition>();
  });

  it('should accept pageInvalid', () => {
    const condition: FormStateCondition = 'pageInvalid';
    expectTypeOf(condition).toMatchTypeOf<FormStateCondition>();
  });
});

// ============================================================================
// StateLogicConfig - Whitelist Test
// ============================================================================

describe('StateLogicConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type' | 'condition' | 'trigger' | 'debounceMs';
  type ActualKeys = keyof StateLogicConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    // Note: trigger is required in DebouncedStateLogicConfig variant,
    // which makes it appear in RequiredKeys for the union type
    it('should have type, condition, and trigger as required', () => {
      expectTypeOf<RequiredKeys<StateLogicConfig>>().toEqualTypeOf<'type' | 'condition' | 'trigger'>();
    });
  });
});

// ============================================================================
// StateLogicConfig - Property Types
// ============================================================================

describe('StateLogicConfig - Property Types', () => {
  it('type should be literal union', () => {
    expectTypeOf<StateLogicConfig['type']>().toEqualTypeOf<'hidden' | 'readonly' | 'disabled' | 'required'>();
  });

  it('condition should accept ConditionalExpression', () => {
    expectTypeOf<ConditionalExpression>().toMatchTypeOf<StateLogicConfig['condition']>();
  });

  it('condition should accept boolean', () => {
    expectTypeOf<boolean>().toMatchTypeOf<StateLogicConfig['condition']>();
  });

  it('condition should accept FormStateCondition', () => {
    expectTypeOf<FormStateCondition>().toMatchTypeOf<StateLogicConfig['condition']>();
  });

  it('condition should be union of all condition types', () => {
    expectTypeOf<StateLogicConfig['condition']>().toEqualTypeOf<ConditionalExpression | boolean | FormStateCondition>();
  });
});

// ============================================================================
// DerivationLogicConfig - Whitelist Test
// ============================================================================

describe('DerivationLogicConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type' | 'condition' | 'value' | 'expression' | 'functionName' | 'trigger' | 'debounceMs' | 'debugName' | 'dependsOn';
  type ActualKeys = keyof DerivationLogicConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    // Note: trigger is required in DebouncedDerivationLogicConfig variant,
    // which makes it appear in RequiredKeys for the union type
    it('should have type and trigger as required', () => {
      expectTypeOf<RequiredKeys<DerivationLogicConfig>>().toEqualTypeOf<'type' | 'trigger'>();
    });
  });
});

// ============================================================================
// DerivationLogicConfig - Property Types
// ============================================================================

describe('DerivationLogicConfig - Property Types', () => {
  it('type should be literal derivation', () => {
    expectTypeOf<DerivationLogicConfig['type']>().toEqualTypeOf<'derivation'>();
  });

  it('condition should be optional', () => {
    expectTypeOf<DerivationLogicConfig['condition']>().toEqualTypeOf<ConditionalExpression | boolean | undefined>();
  });

  it('value should be unknown', () => {
    expectTypeOf<DerivationLogicConfig['value']>().toEqualTypeOf<unknown>();
  });

  it('expression should be string or undefined', () => {
    expectTypeOf<DerivationLogicConfig['expression']>().toEqualTypeOf<string | undefined>();
  });

  it('functionName should be string or undefined', () => {
    expectTypeOf<DerivationLogicConfig['functionName']>().toEqualTypeOf<string | undefined>();
  });

  it('trigger should be DerivationTrigger or undefined', () => {
    expectTypeOf<DerivationLogicConfig['trigger']>().toEqualTypeOf<DerivationTrigger | undefined>();
  });
});

// ============================================================================
// LogicConfig - Union Type
// ============================================================================

describe('LogicConfig - Union Type', () => {
  it('should be union of StateLogicConfig, DerivationLogicConfig and PropertyDerivationLogicConfig', () => {
    expectTypeOf<StateLogicConfig>().toMatchTypeOf<LogicConfig>();
    expectTypeOf<DerivationLogicConfig>().toMatchTypeOf<LogicConfig>();
    expectTypeOf<PropertyDerivationLogicConfig>().toMatchTypeOf<LogicConfig>();
  });

  it('type should include all logic types', () => {
    expectTypeOf<LogicConfig['type']>().toEqualTypeOf<
      'hidden' | 'readonly' | 'disabled' | 'required' | 'derivation' | 'propertyDerivation'
    >();
  });
});

// ============================================================================
// LogicConfig - Usage Examples with Boolean Conditions
// ============================================================================

describe('LogicConfig - Boolean Conditions', () => {
  it('should accept static hidden condition', () => {
    const logic = {
      type: 'hidden',
      condition: true,
    } as const satisfies LogicConfig;

    expectTypeOf(logic.type).toEqualTypeOf<'hidden'>();
    expectTypeOf(logic.condition).toEqualTypeOf<true>();
  });

  it('should accept static disabled condition', () => {
    const logic = {
      type: 'disabled',
      condition: false,
    } as const satisfies LogicConfig;

    expectTypeOf(logic.type).toEqualTypeOf<'disabled'>();
    expectTypeOf(logic.condition).toEqualTypeOf<false>();
  });

  it('should accept static readonly condition', () => {
    const logic = {
      type: 'readonly',
      condition: true,
    } as const satisfies LogicConfig;

    expectTypeOf(logic.type).toEqualTypeOf<'readonly'>();
  });

  it('should accept static required condition', () => {
    const logic = {
      type: 'required',
      condition: false,
    } as const satisfies LogicConfig;

    expectTypeOf(logic.type).toEqualTypeOf<'required'>();
  });
});

// ============================================================================
// LogicConfig - Usage Examples with FormStateCondition
// ============================================================================

describe('LogicConfig - FormStateCondition Examples', () => {
  it('should accept formInvalid condition', () => {
    const logic = {
      type: 'disabled',
      condition: 'formInvalid',
    } as const satisfies LogicConfig;

    expectTypeOf(logic.condition).toEqualTypeOf<'formInvalid'>();
  });

  it('should accept formSubmitting condition', () => {
    const logic = {
      type: 'disabled',
      condition: 'formSubmitting',
    } as const satisfies LogicConfig;

    expectTypeOf(logic.condition).toEqualTypeOf<'formSubmitting'>();
  });

  it('should accept pageInvalid condition', () => {
    const logic = {
      type: 'disabled',
      condition: 'pageInvalid',
    } as const satisfies LogicConfig;

    expectTypeOf(logic.condition).toEqualTypeOf<'pageInvalid'>();
  });
});

// ============================================================================
// LogicConfig - Usage Examples with ConditionalExpression
// ============================================================================

describe('LogicConfig - ConditionalExpression Examples', () => {
  it('should accept fieldValue condition', () => {
    const logic = {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'status',
        operator: 'equals',
        value: 'inactive',
      },
    } as const satisfies LogicConfig;

    expectTypeOf(logic.condition).toMatchTypeOf<ConditionalExpression>();
  });

  it('should accept formValue condition', () => {
    const logic = {
      type: 'disabled',
      condition: {
        type: 'formValue',
        operator: 'equals',
        value: { locked: true },
      },
    } as const satisfies LogicConfig;

    expectTypeOf(logic.condition).toMatchTypeOf<ConditionalExpression>();
  });

  it('should accept custom expression condition', () => {
    const logic = {
      type: 'required',
      condition: {
        type: 'custom',
        expression: 'fieldValue === "other"',
      },
    } as const satisfies LogicConfig;

    expectTypeOf(logic.condition).toMatchTypeOf<ConditionalExpression>();
  });

  it('should accept javascript expression condition', () => {
    const logic = {
      type: 'hidden',
      condition: {
        type: 'javascript',
        expression: 'formValue.age < 18',
      },
    } as const satisfies LogicConfig;

    expectTypeOf(logic.condition).toMatchTypeOf<ConditionalExpression>();
  });

  it('should accept and condition with nested conditions', () => {
    const logic = {
      type: 'disabled',
      condition: {
        type: 'and',
        conditions: [
          {
            type: 'fieldValue',
            fieldPath: 'active',
            operator: 'equals',
            value: true,
          },
          {
            type: 'fieldValue',
            fieldPath: 'verified',
            operator: 'equals',
            value: false,
          },
        ],
      },
    } as const satisfies LogicConfig;

    expectTypeOf(logic.condition).toMatchTypeOf<ConditionalExpression>();
  });

  it('should accept or condition with nested conditions', () => {
    const logic = {
      type: 'required',
      condition: {
        type: 'or',
        conditions: [
          {
            type: 'fieldValue',
            fieldPath: 'method',
            operator: 'equals',
            value: 'email',
          },
          {
            type: 'fieldValue',
            fieldPath: 'method',
            operator: 'equals',
            value: 'sms',
          },
        ],
      },
    } as const satisfies LogicConfig;

    expectTypeOf(logic.condition).toMatchTypeOf<ConditionalExpression>();
  });
});

// ============================================================================
// LogicConfig - Logic Type Examples
// ============================================================================

describe('LogicConfig - Logic Type Examples', () => {
  it('should accept hidden logic', () => {
    const logic = {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'showField',
        operator: 'equals',
        value: false,
      },
    } as const satisfies LogicConfig;

    expectTypeOf(logic.type).toEqualTypeOf<'hidden'>();
  });

  it('should accept readonly logic', () => {
    const logic = {
      type: 'readonly',
      condition: {
        type: 'fieldValue',
        fieldPath: 'locked',
        operator: 'equals',
        value: true,
      },
    } as const satisfies LogicConfig;

    expectTypeOf(logic.type).toEqualTypeOf<'readonly'>();
  });

  it('should accept disabled logic', () => {
    const logic = {
      type: 'disabled',
      condition: 'formSubmitting',
    } as const satisfies LogicConfig;

    expectTypeOf(logic.type).toEqualTypeOf<'disabled'>();
  });

  it('should accept required logic', () => {
    const logic = {
      type: 'required',
      condition: {
        type: 'fieldValue',
        fieldPath: 'contactMethod',
        operator: 'equals',
        value: 'email',
      },
    } as const satisfies LogicConfig;

    expectTypeOf(logic.type).toEqualTypeOf<'required'>();
  });
});

// ============================================================================
// LogicConfig - Complex Scenarios
// ============================================================================

describe('LogicConfig - Complex Scenarios', () => {
  it('should accept array of logic configs', () => {
    const logicArray = [
      {
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'showEmail',
          operator: 'equals',
          value: false,
        },
      },
      {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'contactMethod',
          operator: 'equals',
          value: 'email',
        },
      },
      {
        type: 'disabled',
        condition: 'formSubmitting',
      },
    ] as const satisfies LogicConfig[];

    expectTypeOf(logicArray).toMatchTypeOf<readonly LogicConfig[]>();
  });

  it('should accept deeply nested conditional logic', () => {
    const logic = {
      type: 'hidden',
      condition: {
        type: 'and',
        conditions: [
          {
            type: 'or',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'role',
                operator: 'equals',
                value: 'admin',
              },
              {
                type: 'fieldValue',
                fieldPath: 'role',
                operator: 'equals',
                value: 'moderator',
              },
            ],
          },
          {
            type: 'fieldValue',
            fieldPath: 'premium',
            operator: 'equals',
            value: true,
          },
        ],
      },
    } as const satisfies LogicConfig;

    expectTypeOf(logic).toMatchTypeOf<LogicConfig>();
  });
});

// ============================================================================
// isFormStateCondition - Type Guard Tests
// ============================================================================

describe('isFormStateCondition - Type Guard', () => {
  it('should be a function', () => {
    expectTypeOf(isFormStateCondition).toBeFunction();
  });

  it('should accept LogicConfig condition parameter', () => {
    expectTypeOf(isFormStateCondition).parameter(0).toMatchTypeOf<LogicConfig['condition']>();
  });

  it('should return boolean', () => {
    expectTypeOf(isFormStateCondition).returns.toEqualTypeOf<boolean>();
  });

  it('should narrow type when true', () => {
    const condition: LogicConfig['condition'] = 'formInvalid' as const;

    if (isFormStateCondition(condition)) {
      expectTypeOf(condition).toMatchTypeOf<FormStateCondition>();
    }
  });
});
