/**
 * Exhaustive type tests for PrimeToggle field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { PrimeToggleProps, PrimeToggleField } from './prime-toggle.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// PrimeToggleProps - Whitelist Test
// ============================================================================

describe('PrimeToggleProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'styleClass' | 'hint';
  type ActualKeys = keyof PrimeToggleProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<PrimeToggleProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('styleClass', () => {
      expectTypeOf<PrimeToggleProps['styleClass']>().toEqualTypeOf<string | undefined>();
    });

    it('hint', () => {
      expectTypeOf<PrimeToggleProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// PrimeToggleField - Whitelist Test
// ============================================================================

describe('PrimeToggleField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof PrimeToggleField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<PrimeToggleField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<PrimeToggleField['type']>().toEqualTypeOf<'toggle'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<PrimeToggleField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = PrimeToggleField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<PrimeToggleField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<PrimeToggleField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<PrimeToggleField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<PrimeToggleField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<PrimeToggleField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<PrimeToggleField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<PrimeToggleField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<PrimeToggleField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<PrimeToggleField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<PrimeToggleField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<PrimeToggleField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is boolean', () => {
      expectTypeOf<PrimeToggleField['value']>().toEqualTypeOf<boolean | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeToggleField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('PrimeToggleField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'toggle',
      key: 'notifications',
      label: 'Enable Notifications',
      value: true,
      props: {
        styleClass: 'custom-toggle',
        hint: 'Toggle to enable or disable notifications',
      },
    } as const satisfies PrimeToggleField;

    expectTypeOf(field.type).toEqualTypeOf<'toggle'>();
    expectTypeOf(field.value).toEqualTypeOf<true>();
  });
});
