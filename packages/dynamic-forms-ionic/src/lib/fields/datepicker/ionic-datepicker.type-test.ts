/**
 * Exhaustive type tests for IonicDatepicker field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { IonicDatepickerProps, IonicDatepickerField } from './ionic-datepicker.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// IonicDatepickerProps - Whitelist Test
// ============================================================================

describe('IonicDatepickerProps - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    | 'presentation'
    | 'multiple'
    | 'preferWheel'
    | 'showDefaultButtons'
    | 'showDefaultTitle'
    | 'showDefaultTimeLabel'
    | 'showClearButton'
    | 'doneText'
    | 'cancelText'
    | 'size'
    | 'color'
    | 'placeholder'
    | 'hint';
  type ActualKeys = keyof IonicDatepickerProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<IonicDatepickerProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('presentation', () => {
      expectTypeOf<IonicDatepickerProps['presentation']>().toEqualTypeOf<
        'date' | 'date-time' | 'time' | 'time-date' | 'month' | 'month-year' | 'year' | undefined
      >();
    });

    it('multiple', () => {
      expectTypeOf<IonicDatepickerProps['multiple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('preferWheel', () => {
      expectTypeOf<IonicDatepickerProps['preferWheel']>().toEqualTypeOf<boolean | undefined>();
    });

    it('showDefaultButtons', () => {
      expectTypeOf<IonicDatepickerProps['showDefaultButtons']>().toEqualTypeOf<boolean | undefined>();
    });

    it('showDefaultTitle', () => {
      expectTypeOf<IonicDatepickerProps['showDefaultTitle']>().toEqualTypeOf<boolean | undefined>();
    });

    it('showDefaultTimeLabel', () => {
      expectTypeOf<IonicDatepickerProps['showDefaultTimeLabel']>().toEqualTypeOf<boolean | undefined>();
    });

    it('showClearButton', () => {
      expectTypeOf<IonicDatepickerProps['showClearButton']>().toEqualTypeOf<boolean | undefined>();
    });

    it('doneText', () => {
      expectTypeOf<IonicDatepickerProps['doneText']>().toEqualTypeOf<string | undefined>();
    });

    it('cancelText', () => {
      expectTypeOf<IonicDatepickerProps['cancelText']>().toEqualTypeOf<string | undefined>();
    });

    it('size', () => {
      expectTypeOf<IonicDatepickerProps['size']>().toEqualTypeOf<'cover' | 'fixed' | undefined>();
    });

    it('color', () => {
      expectTypeOf<IonicDatepickerProps['color']>().toEqualTypeOf<
        'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | undefined
      >();
    });

    it('placeholder', () => {
      expectTypeOf<IonicDatepickerProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// IonicDatepickerField - Whitelist Test
// ============================================================================

describe('IonicDatepickerField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof IonicDatepickerField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<IonicDatepickerField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<IonicDatepickerField['type']>().toEqualTypeOf<'datepicker'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<IonicDatepickerField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = IonicDatepickerField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<IonicDatepickerField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<IonicDatepickerField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicDatepickerField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicDatepickerField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicDatepickerField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicDatepickerField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<IonicDatepickerField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<IonicDatepickerField['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<IonicDatepickerField['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<IonicDatepickerField['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<IonicDatepickerField['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<IonicDatepickerField['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<IonicDatepickerField['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<IonicDatepickerField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<IonicDatepickerField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<IonicDatepickerField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<IonicDatepickerField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys from BaseValueField', () => {
    it('value can be Date or string', () => {
      expectTypeOf<IonicDatepickerField['value']>().toEqualTypeOf<Date | string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<IonicDatepickerField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('datepicker-specific keys', () => {
    it('minDate', () => {
      expectTypeOf<IonicDatepickerField['minDate']>().toEqualTypeOf<Date | string | null | undefined>();
    });

    it('maxDate', () => {
      expectTypeOf<IonicDatepickerField['maxDate']>().toEqualTypeOf<Date | string | null | undefined>();
    });

    it('startAt', () => {
      expectTypeOf<IonicDatepickerField['startAt']>().toEqualTypeOf<Date | null | undefined>();
    });
  });
});

// ============================================================================
// IonicDatepickerField - Usage Tests
// ============================================================================

describe('IonicDatepickerField - Usage Tests', () => {
  it('should accept datepicker with all Ionic props', () => {
    const field = {
      type: 'datepicker',
      key: 'birthday',
      label: 'Birthday',
      props: {
        presentation: 'date',
        multiple: false,
        preferWheel: true,
        showDefaultButtons: true,
        showDefaultTitle: true,
        showDefaultTimeLabel: false,
        showClearButton: true,
        doneText: 'Confirm',
        cancelText: 'Cancel',
        size: 'cover',
        color: 'primary',
        placeholder: 'Select your birthday',
      },
      value: new Date('2000-01-01'),
      minDate: new Date('1900-01-01'),
      maxDate: new Date(),
    } as const satisfies IonicDatepickerField;

    expectTypeOf(field.type).toEqualTypeOf<'datepicker'>();
  });

  it('should accept datepicker without props', () => {
    const field = {
      type: 'datepicker',
      key: 'eventDate',
      value: '2024-12-31',
    } as const satisfies IonicDatepickerField;

    expectTypeOf(field.value).toEqualTypeOf<'2024-12-31'>();
  });

  it('should accept Date value', () => {
    const date = new Date('2024-01-01');
    const field = {
      type: 'datepicker',
      key: 'appointment',
      value: date,
    } as const satisfies IonicDatepickerField;

    expectTypeOf(field.value).toEqualTypeOf<Date>();
  });

  it('should accept string value', () => {
    const field = {
      type: 'datepicker',
      key: 'dueDate',
      value: '2024-12-25',
    } as const satisfies IonicDatepickerField;

    expectTypeOf(field.value).toEqualTypeOf<'2024-12-25'>();
  });

  it('should accept all presentation values', () => {
    const date = {
      type: 'datepicker',
      key: 'd1',
      props: { presentation: 'date' },
    } as const satisfies IonicDatepickerField;

    const dateTime = {
      type: 'datepicker',
      key: 'd2',
      props: { presentation: 'date-time' },
    } as const satisfies IonicDatepickerField;

    const time = {
      type: 'datepicker',
      key: 'd3',
      props: { presentation: 'time' },
    } as const satisfies IonicDatepickerField;

    const timeDate = {
      type: 'datepicker',
      key: 'd4',
      props: { presentation: 'time-date' },
    } as const satisfies IonicDatepickerField;

    const month = {
      type: 'datepicker',
      key: 'd5',
      props: { presentation: 'month' },
    } as const satisfies IonicDatepickerField;

    const monthYear = {
      type: 'datepicker',
      key: 'd6',
      props: { presentation: 'month-year' },
    } as const satisfies IonicDatepickerField;

    const year = {
      type: 'datepicker',
      key: 'd7',
      props: { presentation: 'year' },
    } as const satisfies IonicDatepickerField;

    expectTypeOf(date.type).toEqualTypeOf<'datepicker'>();
    expectTypeOf(dateTime.type).toEqualTypeOf<'datepicker'>();
    expectTypeOf(time.type).toEqualTypeOf<'datepicker'>();
    expectTypeOf(timeDate.type).toEqualTypeOf<'datepicker'>();
    expectTypeOf(month.type).toEqualTypeOf<'datepicker'>();
    expectTypeOf(monthYear.type).toEqualTypeOf<'datepicker'>();
    expectTypeOf(year.type).toEqualTypeOf<'datepicker'>();
  });

  it('should accept multiple dates', () => {
    const field = {
      type: 'datepicker',
      key: 'vacationDates',
      props: { multiple: true },
    } as const satisfies IonicDatepickerField;

    expectTypeOf(field.props?.multiple).toEqualTypeOf<true>();
  });

  it('should accept min and max dates', () => {
    const field = {
      type: 'datepicker',
      key: 'scheduledDate',
      minDate: '2024-01-01',
      maxDate: '2024-12-31',
      startAt: new Date('2024-06-01'),
    } as const satisfies IonicDatepickerField;

    expectTypeOf(field.minDate).toEqualTypeOf<'2024-01-01'>();
    expectTypeOf(field.maxDate).toEqualTypeOf<'2024-12-31'>();
  });

  it('should accept all color values', () => {
    const primary = {
      type: 'datepicker',
      key: 'd1',
      props: { color: 'primary' },
    } as const satisfies IonicDatepickerField;

    const success = {
      type: 'datepicker',
      key: 'd2',
      props: { color: 'success' },
    } as const satisfies IonicDatepickerField;

    const warning = {
      type: 'datepicker',
      key: 'd3',
      props: { color: 'warning' },
    } as const satisfies IonicDatepickerField;

    expectTypeOf(primary.type).toEqualTypeOf<'datepicker'>();
    expectTypeOf(success.type).toEqualTypeOf<'datepicker'>();
    expectTypeOf(warning.type).toEqualTypeOf<'datepicker'>();
  });

  it('should accept all size values', () => {
    const cover = {
      type: 'datepicker',
      key: 'd1',
      props: { size: 'cover' },
    } as const satisfies IonicDatepickerField;

    const fixed = {
      type: 'datepicker',
      key: 'd2',
      props: { size: 'fixed' },
    } as const satisfies IonicDatepickerField;

    expectTypeOf(cover.type).toEqualTypeOf<'datepicker'>();
    expectTypeOf(fixed.type).toEqualTypeOf<'datepicker'>();
  });
});
