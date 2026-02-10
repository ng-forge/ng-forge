/**
 * Exhaustive type tests for PrimeMultiCheckbox field.
 */
import { expectTypeOf } from 'vitest';
import type {
  DynamicText,
  FieldOption,
  LogicConfig,
  SchemaApplicationConfig,
  ValidatorConfig,
  ValidationMessages,
} from '@ng-forge/dynamic-forms';

import type { PrimeMultiCheckboxProps, PrimeMultiCheckboxField } from './prime-multi-checkbox.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// PrimeMultiCheckboxProps - Whitelist Test
// ============================================================================

describe('PrimeMultiCheckboxProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'styleClass' | 'hint';
  type ActualKeys = keyof PrimeMultiCheckboxProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<PrimeMultiCheckboxProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('styleClass', () => {
      expectTypeOf<PrimeMultiCheckboxProps['styleClass']>().toEqualTypeOf<string | undefined>();
    });

    it('hint', () => {
      expectTypeOf<PrimeMultiCheckboxProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// PrimeMultiCheckboxField - Whitelist Test
// ============================================================================

describe('PrimeMultiCheckboxField - Exhaustive Whitelist', () => {
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
    | 'placeholder'
    // From MultiCheckboxField
    | 'options';

  type ActualKeys = keyof PrimeMultiCheckboxField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['type']>().toEqualTypeOf<'multi-checkbox'>();
    });

    it('options is required', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['options']>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = PrimeMultiCheckboxField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is array of generic type', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['value']>().toEqualTypeOf<string[] | undefined>();
      expectTypeOf<PrimeMultiCheckboxField<number>['value']>().toEqualTypeOf<number[] | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeMultiCheckboxField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('PrimeMultiCheckboxField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'multi-checkbox',
      key: 'interests',
      label: 'Interests',
      options: [
        { label: 'Sports', value: 'sports' },
        { label: 'Music', value: 'music' },
        { label: 'Reading', value: 'reading' },
      ],
      value: ['sports', 'music'],
      props: {
        styleClass: 'custom-multi-checkbox',
        hint: 'Select your interests',
      },
    } as const satisfies PrimeMultiCheckboxField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'multi-checkbox'>();
  });

  it('should preserve generic type for value and options', () => {
    const field: PrimeMultiCheckboxField<number> = {
      type: 'multi-checkbox',
      key: 'numbers',
      options: [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
        { label: 'Three', value: 3 },
      ],
      value: [1, 2],
    };

    expectTypeOf(field.value).toEqualTypeOf<number[] | undefined>();
  });
});
