/**
 * Exhaustive type tests for IonicToggle field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { IonicToggleProps, IonicToggleField } from './ionic-toggle.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// IonicToggleProps - Whitelist Test
// ============================================================================

describe('IonicToggleProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'labelPlacement' | 'justify' | 'color' | 'enableOnOffLabels' | 'hint';
  type ActualKeys = keyof IonicToggleProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<IonicToggleProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('labelPlacement', () => {
      expectTypeOf<IonicToggleProps['labelPlacement']>().toEqualTypeOf<'start' | 'end' | 'fixed' | 'stacked' | undefined>();
    });

    it('justify', () => {
      expectTypeOf<IonicToggleProps['justify']>().toEqualTypeOf<'start' | 'end' | 'space-between' | undefined>();
    });

    it('color', () => {
      expectTypeOf<IonicToggleProps['color']>().toEqualTypeOf<
        'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | undefined
      >();
    });

    it('enableOnOffLabels', () => {
      expectTypeOf<IonicToggleProps['enableOnOffLabels']>().toEqualTypeOf<boolean | undefined>();
    });
  });
});

// ============================================================================
// IonicToggleField - Whitelist Test
// ============================================================================

describe('IonicToggleField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof IonicToggleField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<IonicToggleField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<IonicToggleField['type']>().toEqualTypeOf<'toggle'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<IonicToggleField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = IonicToggleField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<IonicToggleField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<IonicToggleField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicToggleField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicToggleField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicToggleField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicToggleField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<IonicToggleField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<IonicToggleField['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<IonicToggleField['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<IonicToggleField['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<IonicToggleField['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<IonicToggleField['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<IonicToggleField['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<IonicToggleField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<IonicToggleField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<IonicToggleField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<IonicToggleField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('checked field keys from BaseCheckedField', () => {
    it('value is boolean', () => {
      expectTypeOf<IonicToggleField['value']>().toEqualTypeOf<boolean | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<IonicToggleField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// IonicToggleField - Usage Tests
// ============================================================================

describe('IonicToggleField - Usage Tests', () => {
  it('should accept toggle with all Ionic props', () => {
    const field = {
      type: 'toggle',
      key: 'notifications',
      label: 'Enable Notifications',
      props: {
        labelPlacement: 'start',
        justify: 'space-between',
        color: 'success',
        enableOnOffLabels: true,
      },
      value: true,
    } as const satisfies IonicToggleField;

    expectTypeOf(field.value).toEqualTypeOf<true>();
  });

  it('should accept toggle without props', () => {
    const field = {
      type: 'toggle',
      key: 'darkMode',
      label: 'Dark Mode',
      value: false,
    } as const satisfies IonicToggleField;

    expectTypeOf(field.value).toEqualTypeOf<false>();
  });

  it('should accept all labelPlacement values', () => {
    const start = {
      type: 'toggle',
      key: 'tg1',
      props: { labelPlacement: 'start' },
    } as const satisfies IonicToggleField;

    const end = {
      type: 'toggle',
      key: 'tg2',
      props: { labelPlacement: 'end' },
    } as const satisfies IonicToggleField;

    const fixed = {
      type: 'toggle',
      key: 'tg3',
      props: { labelPlacement: 'fixed' },
    } as const satisfies IonicToggleField;

    const stacked = {
      type: 'toggle',
      key: 'tg4',
      props: { labelPlacement: 'stacked' },
    } as const satisfies IonicToggleField;

    expectTypeOf(start.type).toEqualTypeOf<'toggle'>();
    expectTypeOf(end.type).toEqualTypeOf<'toggle'>();
    expectTypeOf(fixed.type).toEqualTypeOf<'toggle'>();
    expectTypeOf(stacked.type).toEqualTypeOf<'toggle'>();
  });

  it('should accept all justify values', () => {
    const start = {
      type: 'toggle',
      key: 'tg1',
      props: { justify: 'start' },
    } as const satisfies IonicToggleField;

    const end = {
      type: 'toggle',
      key: 'tg2',
      props: { justify: 'end' },
    } as const satisfies IonicToggleField;

    const spaceBetween = {
      type: 'toggle',
      key: 'tg3',
      props: { justify: 'space-between' },
    } as const satisfies IonicToggleField;

    expectTypeOf(start.type).toEqualTypeOf<'toggle'>();
    expectTypeOf(end.type).toEqualTypeOf<'toggle'>();
    expectTypeOf(spaceBetween.type).toEqualTypeOf<'toggle'>();
  });

  it('should accept all color values', () => {
    const primary = {
      type: 'toggle',
      key: 'tg1',
      props: { color: 'primary' },
    } as const satisfies IonicToggleField;

    const warning = {
      type: 'toggle',
      key: 'tg2',
      props: { color: 'warning' },
    } as const satisfies IonicToggleField;

    const tertiary = {
      type: 'toggle',
      key: 'tg3',
      props: { color: 'tertiary' },
    } as const satisfies IonicToggleField;

    expectTypeOf(primary.type).toEqualTypeOf<'toggle'>();
    expectTypeOf(warning.type).toEqualTypeOf<'toggle'>();
    expectTypeOf(tertiary.type).toEqualTypeOf<'toggle'>();
  });

  it('should accept enableOnOffLabels', () => {
    const field = {
      type: 'toggle',
      key: 'setting',
      props: { enableOnOffLabels: true },
    } as const satisfies IonicToggleField;

    expectTypeOf(field.props?.enableOnOffLabels).toEqualTypeOf<true>();
  });
});
