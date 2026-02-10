/**
 * Exhaustive type tests for PrimeCheckbox field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { PrimeCheckboxProps, PrimeCheckboxField } from './prime-checkbox.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// PrimeCheckboxProps - Whitelist Test
// ============================================================================

describe('PrimeCheckboxProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'binary' | 'styleClass' | 'trueValue' | 'falseValue' | 'hint';
  type ActualKeys = keyof PrimeCheckboxProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<PrimeCheckboxProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('binary', () => {
      expectTypeOf<PrimeCheckboxProps['binary']>().toEqualTypeOf<boolean | undefined>();
    });

    it('styleClass', () => {
      expectTypeOf<PrimeCheckboxProps['styleClass']>().toEqualTypeOf<string | undefined>();
    });

    it('trueValue', () => {
      expectTypeOf<PrimeCheckboxProps['trueValue']>().toEqualTypeOf<unknown>();
    });

    it('falseValue', () => {
      expectTypeOf<PrimeCheckboxProps['falseValue']>().toEqualTypeOf<unknown>();
    });

    it('hint', () => {
      expectTypeOf<PrimeCheckboxProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// PrimeCheckboxField - Whitelist Test
// ============================================================================

describe('PrimeCheckboxField - Exhaustive Whitelist', () => {
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
    // From BaseCheckedField
    | 'value'
    | 'placeholder';

  type ActualKeys = keyof PrimeCheckboxField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<PrimeCheckboxField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<PrimeCheckboxField['type']>().toEqualTypeOf<'checkbox'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<PrimeCheckboxField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = PrimeCheckboxField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<PrimeCheckboxField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<PrimeCheckboxField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<PrimeCheckboxField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<PrimeCheckboxField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<PrimeCheckboxField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<PrimeCheckboxField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<PrimeCheckboxField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<PrimeCheckboxField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<PrimeCheckboxField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<PrimeCheckboxField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<PrimeCheckboxField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is boolean', () => {
      expectTypeOf<PrimeCheckboxField['value']>().toEqualTypeOf<boolean | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeCheckboxField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('PrimeCheckboxField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'checkbox',
      key: 'agree',
      label: 'I agree to terms',
      value: false,
      props: {
        binary: true,
        styleClass: 'custom-checkbox',
        hint: 'Please read the terms carefully',
      },
    } as const satisfies PrimeCheckboxField;

    expectTypeOf(field.type).toEqualTypeOf<'checkbox'>();
    expectTypeOf(field.value).toEqualTypeOf<false>();
  });
});
