/**
 * Exhaustive type tests for DatepickerField and DatepickerProps types.
 */
import { expectTypeOf } from 'vitest';
import type { DatepickerField, DatepickerProps } from './datepicker-field';
import type { DynamicText } from '@ng-forge/dynamic-forms';

// ============================================================================
// DatepickerProps - Whitelist Test
// ============================================================================

describe('DatepickerProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'placeholder';
  type ActualKeys = keyof DatepickerProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('placeholder is optional DynamicText', () => {
    expectTypeOf<DatepickerProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
  });
});

// ============================================================================
// DatepickerField - Whitelist Test
// ============================================================================

describe('DatepickerField - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    // FieldDef
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
    // BaseValueField
    | 'value'
    | 'placeholder'
    | 'required'
    // FieldWithValidation
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
    // DatepickerField-specific
    | 'minDate'
    | 'maxDate'
    | 'startAt';

  type ActualKeys = keyof DatepickerField<DatepickerProps>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('type is literal "datepicker"', () => {
    expectTypeOf<DatepickerField<DatepickerProps>['type']>().toEqualTypeOf<'datepicker'>();
  });

  it('value type is Date | string', () => {
    expectTypeOf<DatepickerField<DatepickerProps>['value']>().toEqualTypeOf<Date | string | undefined>();
  });

  it('minDate accepts Date | string | null', () => {
    expectTypeOf<DatepickerField<DatepickerProps>['minDate']>().toEqualTypeOf<Date | string | null | undefined>();
  });

  it('maxDate accepts Date | string | null', () => {
    expectTypeOf<DatepickerField<DatepickerProps>['maxDate']>().toEqualTypeOf<Date | string | null | undefined>();
  });

  it('startAt accepts Date | null', () => {
    expectTypeOf<DatepickerField<DatepickerProps>['startAt']>().toEqualTypeOf<Date | null | undefined>();
  });
});

// ============================================================================
// DatepickerField - Generic TProps Parameter
// ============================================================================

describe('DatepickerField - Generic TProps', () => {
  interface CustomProps {
    placeholder?: DynamicText;
    customOption: string;
  }

  it('should accept custom TProps', () => {
    expectTypeOf<DatepickerField<CustomProps>['props']>().toEqualTypeOf<CustomProps | undefined>();
  });
});

// ============================================================================
// DatepickerField - Usage Tests
// ============================================================================

describe('DatepickerField - Usage Tests', () => {
  it('should accept minimal datepicker field', () => {
    const field = {
      key: 'birthDate',
      type: 'datepicker',
    } as const satisfies DatepickerField<DatepickerProps>;

    expectTypeOf(field.type).toEqualTypeOf<'datepicker'>();
  });

  it('should accept full datepicker field', () => {
    const field = {
      key: 'appointmentDate',
      type: 'datepicker',
      label: 'Appointment Date',
      value: '2026-01-01',
      minDate: new Date('2026-01-01'),
      maxDate: '2026-12-31',
      startAt: new Date('2026-06-01'),
      placeholder: 'Select a date',
      props: {
        placeholder: 'Pick date',
      },
    } as const satisfies DatepickerField<DatepickerProps>;

    expectTypeOf(field.type).toEqualTypeOf<'datepicker'>();
  });

  it('should accept null for minDate, maxDate, startAt', () => {
    const field = {
      key: 'flexDate',
      type: 'datepicker',
      minDate: null,
      maxDate: null,
      startAt: null,
    } as const satisfies DatepickerField<DatepickerProps>;

    expectTypeOf(field.minDate).toEqualTypeOf<null>();
    expectTypeOf(field.maxDate).toEqualTypeOf<null>();
    expectTypeOf(field.startAt).toEqualTypeOf<null>();
  });
});
