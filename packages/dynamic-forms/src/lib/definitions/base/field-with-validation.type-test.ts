/**
 * Exhaustive type tests for FieldWithValidation interface.
 */
import { expectTypeOf } from 'vitest';
import type { ValidatorConfig } from '../../models/validation/validator-config';
import type { LogicConfig } from '../../models/logic/logic-config';
import type { SchemaApplicationConfig } from '../../models/schemas/schema-definition';
import type { ValidationMessages } from '../../models/validation-types';
import type { FieldWithValidation } from './field-with-validation';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// FieldWithValidation - Whitelist Test
// ============================================================================

describe('FieldWithValidation - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    // Simple validation rules
    | 'required'
    | 'email'
    | 'min'
    | 'max'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    // Advanced validation
    | 'validators'
    | 'validationMessages'
    // Logic rules
    | 'logic'
    // Derivation shorthand
    | 'derivation'
    // Schema applications
    | 'schemas';

  type ActualKeys = keyof FieldWithValidation;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional and readonly', () => {
    expectTypeOf<RequiredKeys<FieldWithValidation>>().toEqualTypeOf<never>();
  });
});

// ============================================================================
// FieldWithValidation - Simple Validation Rules
// ============================================================================

describe('FieldWithValidation - Simple Validation Rules', () => {
  it('required', () => {
    expectTypeOf<FieldWithValidation['required']>().toEqualTypeOf<boolean | undefined>();
  });

  it('email', () => {
    expectTypeOf<FieldWithValidation['email']>().toEqualTypeOf<boolean | undefined>();
  });

  it('min', () => {
    expectTypeOf<FieldWithValidation['min']>().toEqualTypeOf<number | undefined>();
  });

  it('max', () => {
    expectTypeOf<FieldWithValidation['max']>().toEqualTypeOf<number | undefined>();
  });

  it('minLength', () => {
    expectTypeOf<FieldWithValidation['minLength']>().toEqualTypeOf<number | undefined>();
  });

  it('maxLength', () => {
    expectTypeOf<FieldWithValidation['maxLength']>().toEqualTypeOf<number | undefined>();
  });

  it('pattern', () => {
    expectTypeOf<FieldWithValidation['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
  });
});

// ============================================================================
// FieldWithValidation - Advanced Validation
// ============================================================================

describe('FieldWithValidation - Advanced Validation', () => {
  it('validators', () => {
    expectTypeOf<FieldWithValidation['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
  });

  it('validationMessages', () => {
    expectTypeOf<FieldWithValidation['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
  });
});

// ============================================================================
// FieldWithValidation - Logic Rules
// ============================================================================

describe('FieldWithValidation - Logic Rules', () => {
  it('logic', () => {
    expectTypeOf<FieldWithValidation['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
  });

  it('derivation', () => {
    expectTypeOf<FieldWithValidation['derivation']>().toEqualTypeOf<string | undefined>();
  });
});

// ============================================================================
// FieldWithValidation - Schema Applications
// ============================================================================

describe('FieldWithValidation - Schema Applications', () => {
  it('schemas', () => {
    expectTypeOf<FieldWithValidation['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
  });
});

// ============================================================================
// FieldWithValidation - Usage Examples
// ============================================================================

describe('FieldWithValidation - Usage Examples', () => {
  it('should accept field with simple validation rules', () => {
    const field = {
      required: true,
      email: true,
      minLength: 3,
      maxLength: 50,
    } as const satisfies FieldWithValidation;

    expectTypeOf(field.required).toEqualTypeOf<true>();
    expectTypeOf(field.email).toEqualTypeOf<true>();
    expectTypeOf(field.minLength).toEqualTypeOf<3>();
    expectTypeOf(field.maxLength).toEqualTypeOf<50>();
  });

  it('should accept field with numeric validation', () => {
    const field = {
      required: true,
      min: 0,
      max: 100,
    } as const satisfies FieldWithValidation;

    expectTypeOf(field.min).toEqualTypeOf<0>();
    expectTypeOf(field.max).toEqualTypeOf<100>();
  });

  it('should accept field with pattern validation (string)', () => {
    const field = {
      pattern: '^[A-Za-z]+$',
    } as const satisfies FieldWithValidation;

    expectTypeOf(field.pattern).toEqualTypeOf<'^[A-Za-z]+$'>();
  });

  it('should accept field with pattern validation (RegExp)', () => {
    const field: FieldWithValidation = {
      pattern: /^[A-Za-z]+$/,
    };

    expectTypeOf(field).toMatchTypeOf<FieldWithValidation>();
  });

  it('should accept field with custom validators', () => {
    const field = {
      validators: [{ type: 'required' }, { type: 'email' }, { type: 'custom', functionName: 'passwordStrength' }],
    } as const satisfies FieldWithValidation;

    expectTypeOf(field.validators).toMatchTypeOf<ValidatorConfig[]>();
  });

  it('should accept field with validation messages', () => {
    const field = {
      required: true,
      validationMessages: {
        required: 'This field is required',
        email: 'Please enter a valid email',
        minLength: 'Minimum length is 3 characters',
      },
    } as const satisfies FieldWithValidation;

    expectTypeOf(field.validationMessages).toMatchTypeOf<ValidationMessages>();
  });

  it('should accept field with logic rules', () => {
    const field = {
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'showEmail',
            operator: 'equals',
            value: false,
          },
        },
      ],
    } as const satisfies FieldWithValidation;

    expectTypeOf(field.logic).toMatchTypeOf<LogicConfig[]>();
  });

  it('should accept field with schema applications', () => {
    const field = {
      schemas: [
        {
          type: 'apply',
          schema: 'email-validation',
        },
      ],
    } as const satisfies FieldWithValidation;

    expectTypeOf(field.schemas).toMatchTypeOf<SchemaApplicationConfig[]>();
  });

  it('should accept field with all validation features combined', () => {
    const field = {
      required: true,
      email: true,
      minLength: 5,
      maxLength: 100,
      validators: [{ type: 'custom', functionName: 'uniqueEmail' }],
      validationMessages: {
        required: 'Email is required',
        email: 'Invalid email format',
        minLength: 'Email must be at least 5 characters',
        uniqueEmail: 'Email already exists',
      },
      logic: [
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'equals',
            value: 'email',
          },
        },
      ],
      schemas: [
        {
          type: 'apply',
          schema: 'professional-email',
        },
      ],
    } as const satisfies FieldWithValidation;

    expectTypeOf(field).toMatchTypeOf<FieldWithValidation>();
  });

  it('should accept empty validation config', () => {
    const field = {} as const satisfies FieldWithValidation;

    expectTypeOf(field).toMatchTypeOf<FieldWithValidation>();
  });
});

// ============================================================================
// FieldWithValidation - Complete Field Examples
// ============================================================================

describe('FieldWithValidation - Complete Field Examples', () => {
  it('should accept field with all validation properties', () => {
    const field: FieldWithValidation = {
      required: true,
      email: true,
      min: 0,
      max: 100,
      minLength: 1,
      maxLength: 50,
      pattern: '^test$',
      validators: [],
      validationMessages: {},
      logic: [],
      derivation: 'formValue.quantity * formValue.price',
      schemas: [],
    };

    expectTypeOf(field).toMatchTypeOf<FieldWithValidation>();
  });

  it('should accept field with derivation expression', () => {
    const field = {
      derivation: 'formValue.firstName + " " + formValue.lastName',
    } as const satisfies FieldWithValidation;

    expectTypeOf(field.derivation).toEqualTypeOf<'formValue.firstName + " " + formValue.lastName'>();
  });
});
