/**
 * Exhaustive type tests for BaseValueField interface.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText } from '../../models/types/dynamic-text';
import type { BaseValueField, ValueType, ValueFieldComponent } from './base-value-field';
import type { FieldDef } from './field-def';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// ValueType - Type Tests
// ============================================================================

describe('ValueType - Type Tests', () => {
  it('should include string', () => {
    expectTypeOf<string>().toMatchTypeOf<ValueType>();
  });

  it('should include number', () => {
    expectTypeOf<number>().toMatchTypeOf<ValueType>();
  });

  it('should include boolean', () => {
    expectTypeOf<boolean>().toMatchTypeOf<ValueType>();
  });

  it('should include Date', () => {
    expectTypeOf<Date>().toMatchTypeOf<ValueType>();
  });

  it('should include object', () => {
    expectTypeOf<object>().toMatchTypeOf<ValueType>();
  });

  it('should include unknown[]', () => {
    expectTypeOf<unknown[]>().toMatchTypeOf<ValueType>();
  });

  it('should be a union of all value types', () => {
    expectTypeOf<ValueType>().toEqualTypeOf<string | number | boolean | Date | object | unknown[]>();
  });
});

// ============================================================================
// BaseValueField - Whitelist Test
// ============================================================================

describe('BaseValueField - Exhaustive Whitelist', () => {
  type TestProps = { size?: 'sm' | 'lg' };
  type TestValue = string;

  type ExpectedKeys =
    // From FieldDef
    | 'key'
    | 'type'
    | 'label'
    | 'props'
    | 'className'
    | 'disabled'
    | 'readonly'
    | 'hidden'
    | 'tabIndex'
    | 'col'
    | 'meta'
    // Value exclusion config
    | 'excludeValueIfHidden'
    | 'excludeValueIfDisabled'
    | 'excludeValueIfReadonly'
    // From FieldWithValidation
    | 'required'
    | 'email'
    | 'min'
    | 'max'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'validators'
    | 'validationMessages'
    | 'logic'
    | 'derivation'
    | 'schemas'
    // From BaseValueField
    | 'value'
    | 'placeholder';

  type ActualKeys = keyof BaseValueField<TestProps, TestValue>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('should have key and type as required', () => {
      expectTypeOf<RequiredKeys<BaseValueField<TestProps, TestValue>>>().toEqualTypeOf<'key' | 'type'>();
    });
  });

  describe('optional keys', () => {
    it('should have value as optional', () => {
      expectTypeOf<BaseValueField<TestProps, TestValue>['value']>().toEqualTypeOf<string | undefined>();
    });

    it('should have placeholder as optional', () => {
      expectTypeOf<BaseValueField<TestProps, TestValue>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('should have validation keys as optional', () => {
      expectTypeOf<BaseValueField<TestProps, TestValue>['required']>().toEqualTypeOf<boolean | undefined>();
      expectTypeOf<BaseValueField<TestProps, TestValue>['email']>().toEqualTypeOf<boolean | undefined>();
    });
  });
});

// ============================================================================
// BaseValueField - Property Types
// ============================================================================

describe('BaseValueField - Property Types', () => {
  type TestProps = { size?: 'sm' | 'lg' };
  type TestValue = string;
  type TestField = BaseValueField<TestProps, TestValue>;

  it('value should match TValue generic parameter', () => {
    expectTypeOf<TestField['value']>().toEqualTypeOf<string | undefined>();
  });

  it('placeholder should be DynamicText', () => {
    expectTypeOf<TestField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
  });

  it('required should be boolean', () => {
    expectTypeOf<TestField['required']>().toEqualTypeOf<boolean | undefined>();
  });

  it('should inherit all FieldDef properties', () => {
    expectTypeOf<TestField['key']>().toEqualTypeOf<string>();
    expectTypeOf<TestField['type']>().toEqualTypeOf<string>();
    expectTypeOf<TestField['label']>().toEqualTypeOf<DynamicText | undefined>();
  });

  it('should inherit all FieldWithValidation properties', () => {
    expectTypeOf<TestField['email']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<TestField['min']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<TestField['max']>().toEqualTypeOf<number | undefined>();
  });
});

// ============================================================================
// BaseValueField - Generic Parameters
// ============================================================================

describe('BaseValueField - Generic Parameters', () => {
  it('should accept string value type', () => {
    type StringField = BaseValueField<unknown, string>;
    expectTypeOf<StringField['value']>().toEqualTypeOf<string | undefined>();
  });

  it('should accept number value type', () => {
    type NumberField = BaseValueField<unknown, number>;
    expectTypeOf<NumberField['value']>().toEqualTypeOf<number | undefined>();
  });

  it('should accept boolean value type', () => {
    type BooleanField = BaseValueField<unknown, boolean>;
    expectTypeOf<BooleanField['value']>().toEqualTypeOf<boolean | undefined>();
  });

  it('should accept Date value type', () => {
    type DateField = BaseValueField<unknown, Date>;
    expectTypeOf<DateField['value']>().toEqualTypeOf<Date | undefined>();
  });

  it('should accept object value type', () => {
    type ObjectField = BaseValueField<unknown, { id: string; name: string }>;
    expectTypeOf<ObjectField['value']>().toEqualTypeOf<{ id: string; name: string } | undefined>();
  });

  it('should accept array value type', () => {
    type ArrayField = BaseValueField<unknown, string[]>;
    expectTypeOf<ArrayField['value']>().toEqualTypeOf<string[] | undefined>();
  });

  it('should accept union value type', () => {
    type UnionField = BaseValueField<unknown, string | number>;
    expectTypeOf<UnionField['value']>().toEqualTypeOf<string | number | undefined>();
  });
});

// ============================================================================
// BaseValueField - Usage Examples
// ============================================================================

describe('BaseValueField - Usage Examples', () => {
  it('should accept text input field', () => {
    interface InputProps {
      type?: 'text' | 'email' | 'password';
      maxLength?: number;
    }

    const field = {
      key: 'username',
      type: 'input',
      label: 'Username',
      value: 'john.doe',
      placeholder: 'Enter username',
      required: true,
      minLength: 3,
      maxLength: 20,
      props: {
        type: 'text',
        maxLength: 20,
      },
    } as const satisfies BaseValueField<InputProps, string>;

    expectTypeOf(field.value).toEqualTypeOf<'john.doe'>();
    expectTypeOf(field.placeholder).toEqualTypeOf<'Enter username'>();
  });

  it('should accept number input field', () => {
    const field = {
      key: 'age',
      type: 'number',
      label: 'Age',
      value: 25,
      placeholder: 'Enter your age',
      required: true,
      min: 18,
      max: 120,
    } as const satisfies BaseValueField<unknown, number>;

    expectTypeOf(field.value).toEqualTypeOf<25>();
  });

  it('should accept checkbox field', () => {
    const field = {
      key: 'acceptTerms',
      type: 'checkbox',
      label: 'I accept the terms',
      value: false,
      required: true,
    } as const satisfies BaseValueField<unknown, boolean>;

    expectTypeOf(field.value).toEqualTypeOf<false>();
  });

  it('should accept date field', () => {
    const field: BaseValueField<unknown, Date> = {
      key: 'birthDate',
      type: 'datepicker',
      label: 'Birth Date',
      value: new Date('1990-01-01'),
      required: true,
    };

    expectTypeOf(field).toMatchTypeOf<BaseValueField<unknown, Date>>();
  });

  it('should accept field without value', () => {
    const field: BaseValueField<unknown, string> = {
      key: 'email',
      type: 'input',
      label: 'Email',
      placeholder: 'Enter email',
      required: true,
    };

    expectTypeOf(field.value).toEqualTypeOf<string | undefined>();
  });

  it('should accept field with dynamic placeholder', () => {
    const field = {
      key: 'search',
      type: 'input',
      placeholder: 'form.search.placeholder' as DynamicText,
    } as const satisfies BaseValueField<unknown, string>;

    expectTypeOf(field.placeholder).toMatchTypeOf<DynamicText>();
  });
});

// ============================================================================
// ValueFieldComponent - Type Extraction
// ============================================================================

describe('ValueFieldComponent - Type Extraction', () => {
  interface TestProps {
    size?: 'sm' | 'lg';
  }
  type TestValue = string;
  type TestField = BaseValueField<TestProps, TestValue>;

  it('should transform field to component inputs', () => {
    // Verify that the type includes the necessary properties for components
    type ComponentType = ValueFieldComponent<TestField>;
    expectTypeOf<ComponentType>().toHaveProperty('label');
    expectTypeOf<ComponentType>().toHaveProperty('className');
    expectTypeOf<ComponentType>().toHaveProperty('tabIndex');
    expectTypeOf<ComponentType>().toHaveProperty('placeholder');
    expectTypeOf<ComponentType>().toHaveProperty('validationMessages');
  });
});

// ============================================================================
// BaseValueField - Extends FieldDef and FieldWithValidation
// ============================================================================

describe('BaseValueField - Interface Extension', () => {
  type TestProps = { size?: 'sm' };
  type TestValue = string;
  type TestField = BaseValueField<TestProps, TestValue>;

  it('should be assignable to FieldDef', () => {
    expectTypeOf<TestField>().toMatchTypeOf<FieldDef<TestProps>>();
  });

  it('should have additional value and placeholder properties', () => {
    expectTypeOf<TestField>().toHaveProperty('value');
    expectTypeOf<TestField>().toHaveProperty('placeholder');
  });
});
