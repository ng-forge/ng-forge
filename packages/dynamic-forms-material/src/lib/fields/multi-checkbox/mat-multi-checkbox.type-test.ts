/**
 * Exhaustive type tests for MatMultiCheckbox field.
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

import type { MatMultiCheckboxProps, MatMultiCheckboxField } from './mat-multi-checkbox.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// MatMultiCheckboxProps - Whitelist Test
// ============================================================================

describe('MatMultiCheckboxProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'disableRipple' | 'tabIndex' | 'hint' | 'labelPosition' | 'color';
  type ActualKeys = keyof MatMultiCheckboxProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<MatMultiCheckboxProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('disableRipple', () => {
      expectTypeOf<MatMultiCheckboxProps['disableRipple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<MatMultiCheckboxProps['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('hint', () => {
      expectTypeOf<MatMultiCheckboxProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('labelPosition', () => {
      expectTypeOf<MatMultiCheckboxProps['labelPosition']>().toEqualTypeOf<'before' | 'after' | undefined>();
    });

    it('color', () => {
      expectTypeOf<MatMultiCheckboxProps['color']>().toEqualTypeOf<ThemePalette | undefined>();
    });
  });
});

// ============================================================================
// MatMultiCheckboxField - Whitelist Test
// ============================================================================

describe('MatMultiCheckboxField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof MatMultiCheckboxField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<MatMultiCheckboxField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<MatMultiCheckboxField<string>['type']>().toEqualTypeOf<'multi-checkbox'>();
    });

    it('options is required', () => {
      expectTypeOf<MatMultiCheckboxField<string>['options']>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<MatMultiCheckboxField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = MatMultiCheckboxField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<MatMultiCheckboxField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<MatMultiCheckboxField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<MatMultiCheckboxField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<MatMultiCheckboxField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<MatMultiCheckboxField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<MatMultiCheckboxField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<MatMultiCheckboxField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<MatMultiCheckboxField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<MatMultiCheckboxField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<MatMultiCheckboxField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<MatMultiCheckboxField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is array of generic type', () => {
      expectTypeOf<MatMultiCheckboxField<string>['value']>().toEqualTypeOf<string[] | undefined>();
      expectTypeOf<MatMultiCheckboxField<number>['value']>().toEqualTypeOf<number[] | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatMultiCheckboxField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('MatMultiCheckboxField - Usage', () => {
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
        color: 'primary',
        labelPosition: 'after',
      },
    } as const satisfies MatMultiCheckboxField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'multi-checkbox'>();
  });

  it('should preserve generic type for value and options', () => {
    const field: MatMultiCheckboxField<number> = {
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
