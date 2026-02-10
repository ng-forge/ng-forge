/**
 * Exhaustive type tests for IonicRadio field.
 */
import { expectTypeOf } from 'vitest';
import type {
  DynamicText,
  FieldOption,
  LogicConfig,
  SchemaApplicationConfig,
  ValidatorConfig,
  ValidationMessages,
  ValueType,
} from '@ng-forge/dynamic-forms';

import type { IonicRadioProps, IonicRadioField } from './ionic-radio.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// IonicRadioProps - Whitelist Test
// ============================================================================

describe('IonicRadioProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'labelPlacement' | 'justify' | 'color' | 'compareWith' | 'hint';
  type ActualKeys = keyof IonicRadioProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<IonicRadioProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('labelPlacement', () => {
      expectTypeOf<IonicRadioProps['labelPlacement']>().toEqualTypeOf<'start' | 'end' | 'fixed' | 'stacked' | undefined>();
    });

    it('justify', () => {
      expectTypeOf<IonicRadioProps['justify']>().toEqualTypeOf<'start' | 'end' | 'space-between' | undefined>();
    });

    it('color', () => {
      expectTypeOf<IonicRadioProps['color']>().toEqualTypeOf<
        'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | undefined
      >();
    });

    it('compareWith', () => {
      type CompareWithType = IonicRadioProps['compareWith'];
      expectTypeOf<CompareWithType>().toEqualTypeOf<((o1: ValueType, o2: ValueType) => boolean) | undefined>();
    });
  });
});

// ============================================================================
// IonicRadioField - Whitelist Test
// ============================================================================

describe('IonicRadioField - Exhaustive Whitelist', () => {
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
    // From RadioField
    | 'options';

  type ActualKeys = keyof IonicRadioField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<IonicRadioField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<IonicRadioField<string>['type']>().toEqualTypeOf<'radio'>();
    });

    it('options is required and readonly', () => {
      type OptionsType = IonicRadioField<string>['options'];
      expectTypeOf<OptionsType>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<IonicRadioField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = IonicRadioField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<IonicRadioField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<IonicRadioField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicRadioField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicRadioField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicRadioField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicRadioField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<IonicRadioField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<IonicRadioField<string>['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<IonicRadioField<string>['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<IonicRadioField<string>['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<IonicRadioField<string>['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<IonicRadioField<string>['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<IonicRadioField<string>['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<IonicRadioField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<IonicRadioField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<IonicRadioField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<IonicRadioField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys from BaseValueField', () => {
    it('value type matches generic parameter', () => {
      expectTypeOf<IonicRadioField<string>['value']>().toEqualTypeOf<string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<IonicRadioField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('generic type parameter', () => {
    it('value type is number when T is number', () => {
      expectTypeOf<IonicRadioField<number>['value']>().toEqualTypeOf<number | undefined>();
    });

    it('options type matches generic parameter', () => {
      expectTypeOf<IonicRadioField<number>['options']>().toEqualTypeOf<readonly FieldOption<number>[]>();
    });
  });
});

// ============================================================================
// IonicRadioField - Usage Tests
// ============================================================================

describe('IonicRadioField - Usage Tests', () => {
  it('should accept string radio with Ionic props', () => {
    const field = {
      type: 'radio',
      key: 'gender',
      label: 'Gender',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
      ],
      props: {
        labelPlacement: 'end',
        justify: 'start',
        color: 'primary',
      },
      value: 'male',
    } as const satisfies IonicRadioField<string>;

    expectTypeOf(field.value).toEqualTypeOf<'male'>();
  });

  it('should accept number radio', () => {
    const field = {
      type: 'radio',
      key: 'rating',
      options: [
        { label: 'Poor', value: 1 },
        { label: 'Fair', value: 2 },
        { label: 'Good', value: 3 },
      ],
      value: 2,
    } as const satisfies IonicRadioField<number>;

    expectTypeOf(field.value).toEqualTypeOf<2>();
  });

  it('should accept custom type with compareWith', () => {
    interface Status {
      id: number;
      label: string;
    }

    const field = {
      type: 'radio',
      key: 'status',
      options: [
        { label: 'Active', value: { id: 1, label: 'Active' } },
        { label: 'Inactive', value: { id: 2, label: 'Inactive' } },
      ],
      props: {
        // compareWith uses ValueType since Props are no longer generic
        compareWith: (o1: ValueType, o2: ValueType) => (o1 as Status).id === (o2 as Status).id,
      },
      value: { id: 1, label: 'Active' },
    } as const satisfies IonicRadioField<Status>;

    expectTypeOf(field.value).toEqualTypeOf<{ readonly id: 1; readonly label: 'Active' }>();
  });

  it('should accept all labelPlacement values', () => {
    const start = {
      type: 'radio',
      key: 'r1',
      options: [],
      props: { labelPlacement: 'start' },
    } as const satisfies IonicRadioField<string>;

    const end = {
      type: 'radio',
      key: 'r2',
      options: [],
      props: { labelPlacement: 'end' },
    } as const satisfies IonicRadioField<string>;

    const fixed = {
      type: 'radio',
      key: 'r3',
      options: [],
      props: { labelPlacement: 'fixed' },
    } as const satisfies IonicRadioField<string>;

    const stacked = {
      type: 'radio',
      key: 'r4',
      options: [],
      props: { labelPlacement: 'stacked' },
    } as const satisfies IonicRadioField<string>;

    expectTypeOf(start.type).toEqualTypeOf<'radio'>();
    expectTypeOf(end.type).toEqualTypeOf<'radio'>();
    expectTypeOf(fixed.type).toEqualTypeOf<'radio'>();
    expectTypeOf(stacked.type).toEqualTypeOf<'radio'>();
  });

  it('should accept all justify values', () => {
    const start = {
      type: 'radio',
      key: 'r1',
      options: [],
      props: { justify: 'start' },
    } as const satisfies IonicRadioField<string>;

    const end = {
      type: 'radio',
      key: 'r2',
      options: [],
      props: { justify: 'end' },
    } as const satisfies IonicRadioField<string>;

    const spaceBetween = {
      type: 'radio',
      key: 'r3',
      options: [],
      props: { justify: 'space-between' },
    } as const satisfies IonicRadioField<string>;

    expectTypeOf(start.type).toEqualTypeOf<'radio'>();
    expectTypeOf(end.type).toEqualTypeOf<'radio'>();
    expectTypeOf(spaceBetween.type).toEqualTypeOf<'radio'>();
  });

  it('should accept all color values', () => {
    const primary = {
      type: 'radio',
      key: 'r1',
      options: [],
      props: { color: 'primary' },
    } as const satisfies IonicRadioField<string>;

    const success = {
      type: 'radio',
      key: 'r2',
      options: [],
      props: { color: 'success' },
    } as const satisfies IonicRadioField<string>;

    const tertiary = {
      type: 'radio',
      key: 'r3',
      options: [],
      props: { color: 'tertiary' },
    } as const satisfies IonicRadioField<string>;

    expectTypeOf(primary.type).toEqualTypeOf<'radio'>();
    expectTypeOf(success.type).toEqualTypeOf<'radio'>();
    expectTypeOf(tertiary.type).toEqualTypeOf<'radio'>();
  });
});
