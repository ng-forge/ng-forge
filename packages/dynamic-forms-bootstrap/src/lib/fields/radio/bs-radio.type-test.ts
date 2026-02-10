/**
 * Exhaustive type tests for BsRadio field.
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

import type { BsRadioProps, BsRadioField } from './bs-radio.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// BsRadioProps - Whitelist Test
// ============================================================================

describe('BsRadioProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'inline' | 'reverse' | 'buttonGroup' | 'buttonSize' | 'hint';
  type ActualKeys = keyof BsRadioProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<BsRadioProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('inline', () => {
      expectTypeOf<BsRadioProps['inline']>().toEqualTypeOf<boolean | undefined>();
    });

    it('reverse', () => {
      expectTypeOf<BsRadioProps['reverse']>().toEqualTypeOf<boolean | undefined>();
    });

    it('buttonGroup', () => {
      expectTypeOf<BsRadioProps['buttonGroup']>().toEqualTypeOf<boolean | undefined>();
    });

    it('buttonSize', () => {
      expectTypeOf<BsRadioProps['buttonSize']>().toEqualTypeOf<'sm' | 'lg' | undefined>();
    });

    it('hint', () => {
      expectTypeOf<BsRadioProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// BsRadioField - Whitelist Test
// ============================================================================

describe('BsRadioField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof BsRadioField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<BsRadioField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<BsRadioField<string>['type']>().toEqualTypeOf<'radio'>();
    });

    it('options is required', () => {
      expectTypeOf<BsRadioField<string>['options']>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<BsRadioField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = BsRadioField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<BsRadioField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<BsRadioField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<BsRadioField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<BsRadioField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<BsRadioField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<BsRadioField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<BsRadioField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<BsRadioField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<BsRadioField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<BsRadioField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<BsRadioField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is generic type', () => {
      expectTypeOf<BsRadioField<string>['value']>().toEqualTypeOf<string | undefined>();
      expectTypeOf<BsRadioField<number>['value']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsRadioField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('BsRadioField - Usage', () => {
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
      props: {
        inline: true,
        buttonGroup: true,
        buttonSize: 'sm',
      },
    } as const satisfies BsRadioField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'radio'>();
  });

  it('should preserve generic type for value and options', () => {
    const field = {
      type: 'radio',
      key: 'rating',
      options: [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
        { label: 'Three', value: 3 },
      ],
      value: 2,
    } as const satisfies BsRadioField<number>;

    expectTypeOf(field.value).toEqualTypeOf<2>();
  });
});
