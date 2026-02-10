/**
 * Exhaustive type tests for PrimeDatepicker field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { PrimeDatepickerProps, PrimeDatepickerField } from './prime-datepicker.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// PrimeDatepickerProps - Whitelist Test
// ============================================================================

describe('PrimeDatepickerProps - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    | 'dateFormat'
    | 'inline'
    | 'showIcon'
    | 'showButtonBar'
    | 'selectionMode'
    | 'touchUI'
    | 'view'
    | 'hint'
    | 'styleClass'
    | 'placeholder';
  type ActualKeys = keyof PrimeDatepickerProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<PrimeDatepickerProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('dateFormat', () => {
      expectTypeOf<PrimeDatepickerProps['dateFormat']>().toEqualTypeOf<string | undefined>();
    });

    it('inline', () => {
      expectTypeOf<PrimeDatepickerProps['inline']>().toEqualTypeOf<boolean | undefined>();
    });

    it('showIcon', () => {
      expectTypeOf<PrimeDatepickerProps['showIcon']>().toEqualTypeOf<boolean | undefined>();
    });

    it('showButtonBar', () => {
      expectTypeOf<PrimeDatepickerProps['showButtonBar']>().toEqualTypeOf<boolean | undefined>();
    });

    it('selectionMode', () => {
      expectTypeOf<PrimeDatepickerProps['selectionMode']>().toEqualTypeOf<'single' | 'multiple' | 'range' | undefined>();
    });

    it('touchUI', () => {
      expectTypeOf<PrimeDatepickerProps['touchUI']>().toEqualTypeOf<boolean | undefined>();
    });

    it('view', () => {
      expectTypeOf<PrimeDatepickerProps['view']>().toEqualTypeOf<'date' | 'month' | 'year' | undefined>();
    });

    it('hint', () => {
      expectTypeOf<PrimeDatepickerProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('styleClass', () => {
      expectTypeOf<PrimeDatepickerProps['styleClass']>().toEqualTypeOf<string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeDatepickerProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// PrimeDatepickerField - Whitelist Test
// ============================================================================

describe('PrimeDatepickerField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof PrimeDatepickerField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<PrimeDatepickerField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<PrimeDatepickerField['type']>().toEqualTypeOf<'datepicker'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<PrimeDatepickerField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = PrimeDatepickerField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<PrimeDatepickerField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<PrimeDatepickerField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<PrimeDatepickerField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<PrimeDatepickerField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<PrimeDatepickerField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<PrimeDatepickerField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<PrimeDatepickerField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<PrimeDatepickerField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<PrimeDatepickerField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<PrimeDatepickerField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<PrimeDatepickerField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is Date or string', () => {
      expectTypeOf<PrimeDatepickerField['value']>().toEqualTypeOf<Date | string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeDatepickerField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('datepicker-specific keys', () => {
    it('minDate', () => {
      expectTypeOf<PrimeDatepickerField['minDate']>().toEqualTypeOf<Date | string | null | undefined>();
    });

    it('maxDate', () => {
      expectTypeOf<PrimeDatepickerField['maxDate']>().toEqualTypeOf<Date | string | null | undefined>();
    });

    it('startAt', () => {
      expectTypeOf<PrimeDatepickerField['startAt']>().toEqualTypeOf<Date | null | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('PrimeDatepickerField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'datepicker',
      key: 'birthdate',
      label: 'Birth Date',
      props: {
        dateFormat: 'mm/dd/yy',
        showIcon: true,
        showButtonBar: true,
        hint: 'Select your birth date',
      },
    } as const satisfies PrimeDatepickerField;

    expectTypeOf(field.type).toEqualTypeOf<'datepicker'>();
  });
});
