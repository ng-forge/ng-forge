/**
 * Exhaustive type tests for BsCheckbox field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { BsCheckboxProps, BsCheckboxField } from './bs-checkbox.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// BsCheckboxProps - Whitelist Test
// ============================================================================

describe('BsCheckboxProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'switch' | 'inline' | 'reverse' | 'indeterminate' | 'hint';
  type ActualKeys = keyof BsCheckboxProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<BsCheckboxProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('switch', () => {
      expectTypeOf<BsCheckboxProps['switch']>().toEqualTypeOf<boolean | undefined>();
    });

    it('inline', () => {
      expectTypeOf<BsCheckboxProps['inline']>().toEqualTypeOf<boolean | undefined>();
    });

    it('reverse', () => {
      expectTypeOf<BsCheckboxProps['reverse']>().toEqualTypeOf<boolean | undefined>();
    });

    it('indeterminate', () => {
      expectTypeOf<BsCheckboxProps['indeterminate']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hint', () => {
      expectTypeOf<BsCheckboxProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// BsCheckboxField - Whitelist Test
// ============================================================================

describe('BsCheckboxField - Exhaustive Whitelist', () => {
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
    | 'validateWhenHidden'
    | 'wrappers'
    | 'skipAutoWrappers'
    | 'skipDefaultWrappers'
    | 'addons'
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
    | 'placeholder'
    | 'nullable';

  type ActualKeys = keyof BsCheckboxField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<BsCheckboxField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<BsCheckboxField['type']>().toEqualTypeOf<'checkbox'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<BsCheckboxField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = BsCheckboxField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<BsCheckboxField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<BsCheckboxField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<BsCheckboxField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<BsCheckboxField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<BsCheckboxField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<BsCheckboxField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<BsCheckboxField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<BsCheckboxField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<BsCheckboxField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<BsCheckboxField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<BsCheckboxField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is boolean | null when nullable defaults to boolean', () => {
      // TNullable defaults to `boolean` (= true | false), distributing the conditional
      // value type to `boolean | null`. See base-checked-field.ts.
      expectTypeOf<BsCheckboxField['value']>().toEqualTypeOf<boolean | null | undefined>();
    });

    it('nullable accepts boolean', () => {
      expectTypeOf<BsCheckboxField['nullable']>().toEqualTypeOf<boolean | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsCheckboxField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Nullable - Issue #415
// ============================================================================

describe('BsCheckboxField - Nullable (issue #415)', () => {
  it('should accept null value when nullable: true', () => {
    const field = {
      type: 'checkbox',
      key: 'active',
      label: 'Active',
      value: null,
      nullable: true,
    } as const satisfies BsCheckboxField;

    expectTypeOf(field.value).toEqualTypeOf<null>();
    expectTypeOf(field.nullable).toEqualTypeOf<true>();
  });

  it('should accept null value without explicit nullable flag', () => {
    const field: BsCheckboxField = {
      type: 'checkbox',
      key: 'active',
      value: null,
    };

    expectTypeOf(field.value).toEqualTypeOf<boolean | null | undefined>();
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('BsCheckboxField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'checkbox',
      key: 'agree',
      label: 'I agree to terms',
      value: false,
      props: {
        switch: true,
        inline: true,
        hint: 'Please read the terms carefully',
      },
    } as const satisfies BsCheckboxField;

    expectTypeOf(field.type).toEqualTypeOf<'checkbox'>();
    expectTypeOf(field.value).toEqualTypeOf<false>();
  });
});
