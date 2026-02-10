/**
 * Exhaustive type tests for PrimeSelect field.
 */
import { expectTypeOf } from 'vitest';
import type {
  DynamicText,
  FieldOption,
  LogicConfig,
  SchemaApplicationConfig,
  ValidatorConfig,
  ValidationMessages,
} from '@ng-forge/dynamic-forms';

import type { PrimeSelectProps, PrimeSelectField } from './prime-select.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// PrimeSelectProps - Whitelist Test
// ============================================================================

describe('PrimeSelectProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'multiple' | 'filter' | 'placeholder' | 'showClear' | 'styleClass' | 'hint' | 'compareWith';
  type ActualKeys = keyof PrimeSelectProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<PrimeSelectProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('multiple', () => {
      expectTypeOf<PrimeSelectProps['multiple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('filter', () => {
      expectTypeOf<PrimeSelectProps['filter']>().toEqualTypeOf<boolean | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeSelectProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('showClear', () => {
      expectTypeOf<PrimeSelectProps['showClear']>().toEqualTypeOf<boolean | undefined>();
    });

    it('styleClass', () => {
      expectTypeOf<PrimeSelectProps['styleClass']>().toEqualTypeOf<string | undefined>();
    });

    it('hint', () => {
      expectTypeOf<PrimeSelectProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('compareWith', () => {
      type CompareWithType = PrimeSelectProps['compareWith'];
      // compareWith is a function or undefined
      expectTypeOf<undefined>().toMatchTypeOf<CompareWithType>();
    });
  });
});

// ============================================================================
// PrimeSelectField - Whitelist Test
// ============================================================================

describe('PrimeSelectField - Exhaustive Whitelist', () => {
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
    // From SelectField
    | 'options';

  type ActualKeys = keyof PrimeSelectField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<PrimeSelectField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<PrimeSelectField<string>['type']>().toEqualTypeOf<'select'>();
    });

    it('options is required', () => {
      expectTypeOf<PrimeSelectField<string>['options']>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<PrimeSelectField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = PrimeSelectField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<PrimeSelectField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<PrimeSelectField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<PrimeSelectField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<PrimeSelectField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<PrimeSelectField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<PrimeSelectField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<PrimeSelectField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<PrimeSelectField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<PrimeSelectField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<PrimeSelectField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<PrimeSelectField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is of generic type', () => {
      expectTypeOf<PrimeSelectField<string>['value']>().toEqualTypeOf<string | undefined>();
      expectTypeOf<PrimeSelectField<number>['value']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeSelectField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('PrimeSelectField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'select',
      key: 'country',
      label: 'Country',
      options: [
        { label: 'USA', value: 'usa' },
        { label: 'Canada', value: 'canada' },
        { label: 'Mexico', value: 'mexico' },
      ],
      value: 'usa',
      props: {
        filter: true,
        showClear: true,
        styleClass: 'custom-select',
        hint: 'Select your country',
      },
    } as const satisfies PrimeSelectField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'select'>();
  });

  it('should preserve generic type for value and options', () => {
    const field: PrimeSelectField<number> = {
      type: 'select',
      key: 'quantity',
      options: [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
        { label: 'Three', value: 3 },
      ],
      value: 2,
    };

    expectTypeOf(field.value).toEqualTypeOf<number | undefined>();
  });
});
