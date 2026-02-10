/**
 * Exhaustive type tests for BsMultiCheckbox field.
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

import type { BsMultiCheckboxProps, BsMultiCheckboxField } from './bs-multi-checkbox.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// BsMultiCheckboxProps - Whitelist Test
// ============================================================================

describe('BsMultiCheckboxProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'switch' | 'inline' | 'reverse' | 'hint';
  type ActualKeys = keyof BsMultiCheckboxProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<BsMultiCheckboxProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('switch', () => {
      expectTypeOf<BsMultiCheckboxProps['switch']>().toEqualTypeOf<boolean | undefined>();
    });

    it('inline', () => {
      expectTypeOf<BsMultiCheckboxProps['inline']>().toEqualTypeOf<boolean | undefined>();
    });

    it('reverse', () => {
      expectTypeOf<BsMultiCheckboxProps['reverse']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hint', () => {
      expectTypeOf<BsMultiCheckboxProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// BsMultiCheckboxField - Whitelist Test
// ============================================================================

describe('BsMultiCheckboxField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof BsMultiCheckboxField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<BsMultiCheckboxField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<BsMultiCheckboxField<string>['type']>().toEqualTypeOf<'multi-checkbox'>();
    });

    it('options is required', () => {
      expectTypeOf<BsMultiCheckboxField<string>['options']>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<BsMultiCheckboxField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = BsMultiCheckboxField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<BsMultiCheckboxField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<BsMultiCheckboxField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<BsMultiCheckboxField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<BsMultiCheckboxField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<BsMultiCheckboxField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<BsMultiCheckboxField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<BsMultiCheckboxField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<BsMultiCheckboxField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<BsMultiCheckboxField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<BsMultiCheckboxField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<BsMultiCheckboxField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is array of generic type', () => {
      expectTypeOf<BsMultiCheckboxField<string>['value']>().toEqualTypeOf<string[] | undefined>();
      expectTypeOf<BsMultiCheckboxField<number>['value']>().toEqualTypeOf<number[] | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsMultiCheckboxField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('BsMultiCheckboxField - Usage', () => {
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
        switch: false,
        inline: true,
        hint: 'Select your interests',
      },
    } as const satisfies BsMultiCheckboxField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'multi-checkbox'>();
  });

  it('should preserve generic type for value and options', () => {
    const field: BsMultiCheckboxField<number> = {
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
