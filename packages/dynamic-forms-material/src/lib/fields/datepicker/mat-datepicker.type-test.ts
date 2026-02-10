/**
 * Exhaustive type tests for MatDatepicker field.
 */
import { expectTypeOf } from 'vitest';
import type { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { MatDatepickerProps, MatDatepickerField } from './mat-datepicker.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// MatDatepickerProps - Whitelist Test
// ============================================================================

describe('MatDatepickerProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'appearance' | 'color' | 'disableRipple' | 'subscriptSizing' | 'startView' | 'touchUi' | 'hint' | 'placeholder';
  type ActualKeys = keyof MatDatepickerProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<MatDatepickerProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('appearance', () => {
      expectTypeOf<MatDatepickerProps['appearance']>().toEqualTypeOf<MatFormFieldAppearance | undefined>();
    });

    it('color', () => {
      expectTypeOf<MatDatepickerProps['color']>().toEqualTypeOf<'primary' | 'accent' | 'warn' | undefined>();
    });

    it('disableRipple', () => {
      expectTypeOf<MatDatepickerProps['disableRipple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('subscriptSizing', () => {
      expectTypeOf<MatDatepickerProps['subscriptSizing']>().toEqualTypeOf<SubscriptSizing | undefined>();
    });

    it('startView', () => {
      expectTypeOf<MatDatepickerProps['startView']>().toEqualTypeOf<'month' | 'year' | 'multi-year' | undefined>();
    });

    it('touchUi', () => {
      expectTypeOf<MatDatepickerProps['touchUi']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hint', () => {
      expectTypeOf<MatDatepickerProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatDatepickerProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// MatDatepickerField - Whitelist Test
// ============================================================================

describe('MatDatepickerField - Exhaustive Whitelist', () => {
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
    // From DatepickerField
    | 'minDate'
    | 'maxDate'
    | 'startAt';

  type ActualKeys = keyof MatDatepickerField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<MatDatepickerField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<MatDatepickerField['type']>().toEqualTypeOf<'datepicker'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<MatDatepickerField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = MatDatepickerField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<MatDatepickerField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<MatDatepickerField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<MatDatepickerField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<MatDatepickerField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<MatDatepickerField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<MatDatepickerField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<MatDatepickerField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<MatDatepickerField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<MatDatepickerField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<MatDatepickerField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<MatDatepickerField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is Date or string', () => {
      expectTypeOf<MatDatepickerField['value']>().toEqualTypeOf<Date | string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatDatepickerField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('datepicker-specific keys', () => {
    it('minDate', () => {
      expectTypeOf<MatDatepickerField['minDate']>().toEqualTypeOf<Date | string | null | undefined>();
    });

    it('maxDate', () => {
      expectTypeOf<MatDatepickerField['maxDate']>().toEqualTypeOf<Date | string | null | undefined>();
    });

    it('startAt', () => {
      expectTypeOf<MatDatepickerField['startAt']>().toEqualTypeOf<Date | null | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('MatDatepickerField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'datepicker',
      key: 'birthDate',
      label: 'Birth Date',
      props: {
        appearance: 'outline',
        startView: 'year',
        touchUi: false,
      },
    } as const satisfies MatDatepickerField;

    expectTypeOf(field.type).toEqualTypeOf<'datepicker'>();
  });

  it('should accept Date value', () => {
    const date = new Date('2000-01-01');
    const field = {
      type: 'datepicker',
      key: 'birthDate',
      value: date,
    } as const satisfies MatDatepickerField;

    expectTypeOf(field.value).toEqualTypeOf<Date>();
  });
});
