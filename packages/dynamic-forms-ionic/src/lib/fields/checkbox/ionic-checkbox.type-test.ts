/**
 * Exhaustive type tests for IonicCheckbox field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { IonicCheckboxProps, IonicCheckboxField } from './ionic-checkbox.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// IonicCheckboxProps - Whitelist Test
// ============================================================================

describe('IonicCheckboxProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'labelPlacement' | 'justify' | 'color' | 'indeterminate' | 'hint';
  type ActualKeys = keyof IonicCheckboxProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<IonicCheckboxProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('labelPlacement', () => {
      expectTypeOf<IonicCheckboxProps['labelPlacement']>().toEqualTypeOf<'start' | 'end' | 'fixed' | 'stacked' | undefined>();
    });

    it('justify', () => {
      expectTypeOf<IonicCheckboxProps['justify']>().toEqualTypeOf<'start' | 'end' | 'space-between' | undefined>();
    });

    it('color', () => {
      expectTypeOf<IonicCheckboxProps['color']>().toEqualTypeOf<
        'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | undefined
      >();
    });

    it('indeterminate', () => {
      expectTypeOf<IonicCheckboxProps['indeterminate']>().toEqualTypeOf<boolean | undefined>();
    });
  });
});

// ============================================================================
// IonicCheckboxField - Whitelist Test
// ============================================================================

describe('IonicCheckboxField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof IonicCheckboxField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<IonicCheckboxField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<IonicCheckboxField['type']>().toEqualTypeOf<'checkbox'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<IonicCheckboxField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = IonicCheckboxField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<IonicCheckboxField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<IonicCheckboxField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicCheckboxField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicCheckboxField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicCheckboxField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicCheckboxField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<IonicCheckboxField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<IonicCheckboxField['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<IonicCheckboxField['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<IonicCheckboxField['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<IonicCheckboxField['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<IonicCheckboxField['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<IonicCheckboxField['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<IonicCheckboxField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<IonicCheckboxField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<IonicCheckboxField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<IonicCheckboxField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('checked field keys from BaseCheckedField', () => {
    it('value is boolean', () => {
      expectTypeOf<IonicCheckboxField['value']>().toEqualTypeOf<boolean | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<IonicCheckboxField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// IonicCheckboxField - Usage Tests
// ============================================================================

describe('IonicCheckboxField - Usage Tests', () => {
  it('should accept checkbox with all Ionic props', () => {
    const field = {
      type: 'checkbox',
      key: 'acceptTerms',
      label: 'Accept Terms',
      props: {
        labelPlacement: 'end',
        justify: 'space-between',
        color: 'primary',
        indeterminate: false,
      },
      value: true,
    } as const satisfies IonicCheckboxField;

    expectTypeOf(field.value).toEqualTypeOf<true>();
  });

  it('should accept checkbox without props', () => {
    const field = {
      type: 'checkbox',
      key: 'subscribe',
      label: 'Subscribe to newsletter',
      value: false,
    } as const satisfies IonicCheckboxField;

    expectTypeOf(field.value).toEqualTypeOf<false>();
  });

  it('should accept all labelPlacement values', () => {
    const start = {
      type: 'checkbox',
      key: 'cb1',
      props: { labelPlacement: 'start' },
    } as const satisfies IonicCheckboxField;

    const end = {
      type: 'checkbox',
      key: 'cb2',
      props: { labelPlacement: 'end' },
    } as const satisfies IonicCheckboxField;

    const fixed = {
      type: 'checkbox',
      key: 'cb3',
      props: { labelPlacement: 'fixed' },
    } as const satisfies IonicCheckboxField;

    const stacked = {
      type: 'checkbox',
      key: 'cb4',
      props: { labelPlacement: 'stacked' },
    } as const satisfies IonicCheckboxField;

    expectTypeOf(start.type).toEqualTypeOf<'checkbox'>();
    expectTypeOf(end.type).toEqualTypeOf<'checkbox'>();
    expectTypeOf(fixed.type).toEqualTypeOf<'checkbox'>();
    expectTypeOf(stacked.type).toEqualTypeOf<'checkbox'>();
  });

  it('should accept all justify values', () => {
    const start = {
      type: 'checkbox',
      key: 'cb1',
      props: { justify: 'start' },
    } as const satisfies IonicCheckboxField;

    const end = {
      type: 'checkbox',
      key: 'cb2',
      props: { justify: 'end' },
    } as const satisfies IonicCheckboxField;

    const spaceBetween = {
      type: 'checkbox',
      key: 'cb3',
      props: { justify: 'space-between' },
    } as const satisfies IonicCheckboxField;

    expectTypeOf(start.type).toEqualTypeOf<'checkbox'>();
    expectTypeOf(end.type).toEqualTypeOf<'checkbox'>();
    expectTypeOf(spaceBetween.type).toEqualTypeOf<'checkbox'>();
  });

  it('should accept all color values', () => {
    const primary = {
      type: 'checkbox',
      key: 'cb1',
      props: { color: 'primary' },
    } as const satisfies IonicCheckboxField;

    const secondary = {
      type: 'checkbox',
      key: 'cb2',
      props: { color: 'secondary' },
    } as const satisfies IonicCheckboxField;

    const danger = {
      type: 'checkbox',
      key: 'cb3',
      props: { color: 'danger' },
    } as const satisfies IonicCheckboxField;

    expectTypeOf(primary.type).toEqualTypeOf<'checkbox'>();
    expectTypeOf(secondary.type).toEqualTypeOf<'checkbox'>();
    expectTypeOf(danger.type).toEqualTypeOf<'checkbox'>();
  });

  it('should accept indeterminate state', () => {
    const field = {
      type: 'checkbox',
      key: 'selectAll',
      props: { indeterminate: true },
    } as const satisfies IonicCheckboxField;

    expectTypeOf(field.props?.indeterminate).toEqualTypeOf<true>();
  });
});
