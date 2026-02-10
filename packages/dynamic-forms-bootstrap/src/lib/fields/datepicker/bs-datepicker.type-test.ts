/**
 * Exhaustive type tests for BsDatepicker field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { BsDatepickerProps, BsDatepickerField } from './bs-datepicker.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// BsDatepickerProps - Whitelist Test
// ============================================================================

describe('BsDatepickerProps - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    | 'useNgBootstrap'
    | 'size'
    | 'floatingLabel'
    | 'hint'
    | 'validFeedback'
    | 'invalidFeedback'
    | 'displayMonths'
    | 'navigation'
    | 'outsideDays'
    | 'showWeekNumbers'
    | 'placeholder';
  type ActualKeys = keyof BsDatepickerProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<BsDatepickerProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('useNgBootstrap', () => {
      expectTypeOf<BsDatepickerProps['useNgBootstrap']>().toEqualTypeOf<boolean | undefined>();
    });

    it('size', () => {
      expectTypeOf<BsDatepickerProps['size']>().toEqualTypeOf<'sm' | 'lg' | undefined>();
    });

    it('floatingLabel', () => {
      expectTypeOf<BsDatepickerProps['floatingLabel']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hint', () => {
      expectTypeOf<BsDatepickerProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('validFeedback', () => {
      expectTypeOf<BsDatepickerProps['validFeedback']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('invalidFeedback', () => {
      expectTypeOf<BsDatepickerProps['invalidFeedback']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('displayMonths', () => {
      expectTypeOf<BsDatepickerProps['displayMonths']>().toEqualTypeOf<number | undefined>();
    });

    it('navigation', () => {
      expectTypeOf<BsDatepickerProps['navigation']>().toEqualTypeOf<'select' | 'arrows' | 'none' | undefined>();
    });

    it('outsideDays', () => {
      expectTypeOf<BsDatepickerProps['outsideDays']>().toEqualTypeOf<'visible' | 'collapsed' | 'hidden' | undefined>();
    });

    it('showWeekNumbers', () => {
      expectTypeOf<BsDatepickerProps['showWeekNumbers']>().toEqualTypeOf<boolean | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsDatepickerProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// BsDatepickerField - Whitelist Test
// ============================================================================

describe('BsDatepickerField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof BsDatepickerField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<BsDatepickerField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<BsDatepickerField['type']>().toEqualTypeOf<'datepicker'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<BsDatepickerField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = BsDatepickerField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<BsDatepickerField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<BsDatepickerField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<BsDatepickerField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<BsDatepickerField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<BsDatepickerField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<BsDatepickerField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<BsDatepickerField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<BsDatepickerField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<BsDatepickerField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<BsDatepickerField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<BsDatepickerField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is Date or string', () => {
      expectTypeOf<BsDatepickerField['value']>().toEqualTypeOf<Date | string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsDatepickerField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('datepicker-specific keys', () => {
    it('minDate', () => {
      expectTypeOf<BsDatepickerField['minDate']>().toEqualTypeOf<Date | string | null | undefined>();
    });

    it('maxDate', () => {
      expectTypeOf<BsDatepickerField['maxDate']>().toEqualTypeOf<Date | string | null | undefined>();
    });

    it('startAt', () => {
      expectTypeOf<BsDatepickerField['startAt']>().toEqualTypeOf<Date | null | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('BsDatepickerField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'datepicker',
      key: 'birthDate',
      label: 'Birth Date',
      props: {
        useNgBootstrap: true,
        size: 'lg',
        floatingLabel: true,
        navigation: 'select',
        showWeekNumbers: true,
      },
    } as const satisfies BsDatepickerField;

    expectTypeOf(field.type).toEqualTypeOf<'datepicker'>();
  });

  it('should accept Date value', () => {
    const date = new Date('2000-01-01');
    const field = {
      type: 'datepicker',
      key: 'birthDate',
      value: date,
    } as const satisfies BsDatepickerField;

    expectTypeOf(field.value).toEqualTypeOf<Date>();
  });
});
