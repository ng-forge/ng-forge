/**
 * Exhaustive type tests for MatRadio field.
 */
import { expectTypeOf } from 'vitest';
import type { ThemePalette } from '@angular/material/core';
import type {
  DynamicText,
  FieldOption,
  LogicConfig,
  SchemaApplicationConfig,
  ValidatorConfig,
  ValidationMessages,
} from '@ng-forge/dynamic-forms';

import type { MatRadioProps, MatRadioField } from './mat-radio.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// MatRadioProps - Whitelist Test
// ============================================================================

describe('MatRadioProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'disableRipple' | 'color' | 'labelPosition' | 'hint';
  type ActualKeys = keyof MatRadioProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<MatRadioProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('disableRipple', () => {
      expectTypeOf<MatRadioProps['disableRipple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('color', () => {
      expectTypeOf<MatRadioProps['color']>().toEqualTypeOf<ThemePalette | undefined>();
    });

    it('labelPosition', () => {
      expectTypeOf<MatRadioProps['labelPosition']>().toEqualTypeOf<'before' | 'after' | undefined>();
    });

    it('hint', () => {
      expectTypeOf<MatRadioProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// MatRadioField - Whitelist Test
// ============================================================================

describe('MatRadioField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof MatRadioField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<MatRadioField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<MatRadioField<string>['type']>().toEqualTypeOf<'radio'>();
    });

    it('options is required', () => {
      expectTypeOf<MatRadioField<string>['options']>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<MatRadioField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = MatRadioField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<MatRadioField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<MatRadioField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<MatRadioField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<MatRadioField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<MatRadioField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<MatRadioField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<MatRadioField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<MatRadioField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<MatRadioField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<MatRadioField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<MatRadioField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is generic type', () => {
      expectTypeOf<MatRadioField<string>['value']>().toEqualTypeOf<string | undefined>();
      expectTypeOf<MatRadioField<number>['value']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatRadioField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('MatRadioField - Usage', () => {
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
        color: 'primary',
        labelPosition: 'after',
      },
    } as const satisfies MatRadioField<string>;

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
    } as const satisfies MatRadioField<number>;

    expectTypeOf(field.value).toEqualTypeOf<2>();
  });
});
