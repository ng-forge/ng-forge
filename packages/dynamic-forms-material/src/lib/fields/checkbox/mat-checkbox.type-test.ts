/**
 * Exhaustive type tests for MatCheckbox field.
 */
import { expectTypeOf } from 'vitest';
import type { ThemePalette } from '@angular/material/core';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { MatCheckboxProps, MatCheckboxField } from './mat-checkbox.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// MatCheckboxProps - Whitelist Test
// ============================================================================

describe('MatCheckboxProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'color' | 'disableRipple' | 'labelPosition' | 'hint' | 'indeterminate';
  type ActualKeys = keyof MatCheckboxProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<MatCheckboxProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('color', () => {
      expectTypeOf<MatCheckboxProps['color']>().toEqualTypeOf<ThemePalette | undefined>();
    });

    it('disableRipple', () => {
      expectTypeOf<MatCheckboxProps['disableRipple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('labelPosition', () => {
      expectTypeOf<MatCheckboxProps['labelPosition']>().toEqualTypeOf<'before' | 'after' | undefined>();
    });

    it('hint', () => {
      expectTypeOf<MatCheckboxProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('indeterminate', () => {
      expectTypeOf<MatCheckboxProps['indeterminate']>().toEqualTypeOf<boolean | undefined>();
    });
  });
});

// ============================================================================
// MatCheckboxField - Whitelist Test
// ============================================================================

describe('MatCheckboxField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof MatCheckboxField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<MatCheckboxField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<MatCheckboxField['type']>().toEqualTypeOf<'checkbox'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<MatCheckboxField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = MatCheckboxField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<MatCheckboxField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<MatCheckboxField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<MatCheckboxField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<MatCheckboxField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<MatCheckboxField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<MatCheckboxField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<MatCheckboxField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<MatCheckboxField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<MatCheckboxField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<MatCheckboxField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<MatCheckboxField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is boolean', () => {
      expectTypeOf<MatCheckboxField['value']>().toEqualTypeOf<boolean | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatCheckboxField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('MatCheckboxField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'checkbox',
      key: 'agree',
      label: 'I agree to terms',
      value: false,
      props: {
        color: 'primary',
        labelPosition: 'after',
      },
    } as const satisfies MatCheckboxField;

    expectTypeOf(field.type).toEqualTypeOf<'checkbox'>();
    expectTypeOf(field.value).toEqualTypeOf<false>();
  });
});
