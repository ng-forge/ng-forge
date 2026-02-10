/**
 * Exhaustive type tests for MatToggle field.
 */
import { expectTypeOf } from 'vitest';
import type { MatFormFieldAppearance } from '@angular/material/form-field';
import type { ThemePalette } from '@angular/material/core';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { MatToggleProps, MatToggleField } from './mat-toggle.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// MatToggleProps - Whitelist Test
// ============================================================================

describe('MatToggleProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'hint' | 'appearance' | 'color' | 'labelPosition' | 'disableRipple' | 'hideIcon';
  type ActualKeys = keyof MatToggleProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<MatToggleProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('hint', () => {
      expectTypeOf<MatToggleProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('appearance', () => {
      expectTypeOf<MatToggleProps['appearance']>().toEqualTypeOf<MatFormFieldAppearance | undefined>();
    });

    it('color', () => {
      expectTypeOf<MatToggleProps['color']>().toEqualTypeOf<ThemePalette | undefined>();
    });

    it('labelPosition', () => {
      expectTypeOf<MatToggleProps['labelPosition']>().toEqualTypeOf<'before' | 'after' | undefined>();
    });

    it('disableRipple', () => {
      expectTypeOf<MatToggleProps['disableRipple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hideIcon', () => {
      expectTypeOf<MatToggleProps['hideIcon']>().toEqualTypeOf<boolean | undefined>();
    });
  });
});

// ============================================================================
// MatToggleField - Whitelist Test
// ============================================================================

describe('MatToggleField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof MatToggleField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<MatToggleField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<MatToggleField['type']>().toEqualTypeOf<'toggle'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<MatToggleField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = MatToggleField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<MatToggleField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<MatToggleField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<MatToggleField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<MatToggleField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<MatToggleField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<MatToggleField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<MatToggleField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<MatToggleField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<MatToggleField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<MatToggleField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<MatToggleField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is boolean', () => {
      expectTypeOf<MatToggleField['value']>().toEqualTypeOf<boolean | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatToggleField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('MatToggleField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'toggle',
      key: 'notifications',
      label: 'Enable notifications',
      value: true,
      props: {
        color: 'accent',
        hideIcon: false,
      },
    } as const satisfies MatToggleField;

    expectTypeOf(field.type).toEqualTypeOf<'toggle'>();
    expectTypeOf(field.value).toEqualTypeOf<true>();
  });
});
