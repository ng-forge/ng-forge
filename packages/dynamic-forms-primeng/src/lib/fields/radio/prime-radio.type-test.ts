/**
 * Exhaustive type tests for PrimeRadio field.
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

import type { PrimeRadioProps, PrimeRadioField } from './prime-radio.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// PrimeRadioProps - Whitelist Test
// ============================================================================

describe('PrimeRadioProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'name' | 'styleClass' | 'hint';
  type ActualKeys = keyof PrimeRadioProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<PrimeRadioProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('name', () => {
      expectTypeOf<PrimeRadioProps['name']>().toEqualTypeOf<string | undefined>();
    });

    it('styleClass', () => {
      expectTypeOf<PrimeRadioProps['styleClass']>().toEqualTypeOf<string | undefined>();
    });

    it('hint', () => {
      expectTypeOf<PrimeRadioProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// PrimeRadioField - Whitelist Test
// ============================================================================

describe('PrimeRadioField - Exhaustive Whitelist', () => {
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
    // From RadioField
    | 'options';

  type ActualKeys = keyof PrimeRadioField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<PrimeRadioField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<PrimeRadioField<string>['type']>().toEqualTypeOf<'radio'>();
    });

    it('options is required', () => {
      expectTypeOf<PrimeRadioField<string>['options']>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<PrimeRadioField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = PrimeRadioField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<PrimeRadioField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<PrimeRadioField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<PrimeRadioField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<PrimeRadioField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<PrimeRadioField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<PrimeRadioField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<PrimeRadioField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<PrimeRadioField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<PrimeRadioField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<PrimeRadioField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<PrimeRadioField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is of generic type', () => {
      expectTypeOf<PrimeRadioField<string>['value']>().toEqualTypeOf<string | undefined>();
      expectTypeOf<PrimeRadioField<number>['value']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeRadioField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('PrimeRadioField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'radio',
      key: 'gender',
      label: 'Gender',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
      ],
      value: 'male',
      props: {
        name: 'gender-group',
        styleClass: 'custom-radio',
        hint: 'Select your gender',
      },
    } as const satisfies PrimeRadioField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'radio'>();
  });

  it('should preserve generic type for value and options', () => {
    const field: PrimeRadioField<number> = {
      type: 'radio',
      key: 'rating',
      options: [
        { label: 'One Star', value: 1 },
        { label: 'Two Stars', value: 2 },
        { label: 'Three Stars', value: 3 },
      ],
      value: 2,
    };

    expectTypeOf(field.value).toEqualTypeOf<number | undefined>();
  });
});
