/**
 * Exhaustive type tests for IonicMultiCheckbox field.
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

import type { IonicMultiCheckboxProps, IonicMultiCheckboxField } from './ionic-multi-checkbox.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// IonicMultiCheckboxProps - Whitelist Test
// ============================================================================

describe('IonicMultiCheckboxProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'labelPlacement' | 'justify' | 'color' | 'hint';
  type ActualKeys = keyof IonicMultiCheckboxProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<IonicMultiCheckboxProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('labelPlacement', () => {
      expectTypeOf<IonicMultiCheckboxProps['labelPlacement']>().toEqualTypeOf<'start' | 'end' | 'fixed' | 'stacked' | undefined>();
    });

    it('justify', () => {
      expectTypeOf<IonicMultiCheckboxProps['justify']>().toEqualTypeOf<'start' | 'end' | 'space-between' | undefined>();
    });

    it('color', () => {
      expectTypeOf<IonicMultiCheckboxProps['color']>().toEqualTypeOf<
        'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | undefined
      >();
    });
  });
});

// ============================================================================
// IonicMultiCheckboxField - Whitelist Test
// ============================================================================

describe('IonicMultiCheckboxField - Exhaustive Whitelist', () => {
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
    // From MultiCheckboxField
    | 'options';

  type ActualKeys = keyof IonicMultiCheckboxField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['type']>().toEqualTypeOf<'multi-checkbox'>();
    });

    it('options is required and readonly', () => {
      type OptionsType = IonicMultiCheckboxField<string>['options'];
      expectTypeOf<OptionsType>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = IonicMultiCheckboxField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys from BaseValueField', () => {
    it('value is array of T', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['value']>().toEqualTypeOf<string[] | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<IonicMultiCheckboxField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('generic type parameter', () => {
    it('value type is number[] when T is number', () => {
      expectTypeOf<IonicMultiCheckboxField<number>['value']>().toEqualTypeOf<number[] | undefined>();
    });

    it('options type matches generic parameter', () => {
      expectTypeOf<IonicMultiCheckboxField<number>['options']>().toEqualTypeOf<readonly FieldOption<number>[]>();
    });
  });
});

// ============================================================================
// IonicMultiCheckboxField - Usage Tests
// ============================================================================

describe('IonicMultiCheckboxField - Usage Tests', () => {
  it('should accept string multi-checkbox with Ionic props', () => {
    const field = {
      type: 'multi-checkbox',
      key: 'interests',
      label: 'Select your interests',
      options: [
        { label: 'Sports', value: 'sports' },
        { label: 'Music', value: 'music' },
        { label: 'Art', value: 'art' },
      ],
      props: {
        labelPlacement: 'end',
        justify: 'start',
        color: 'primary',
      },
      value: ['sports', 'music'],
    } as const satisfies IonicMultiCheckboxField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'multi-checkbox'>();
  });

  it('should accept number multi-checkbox', () => {
    const field = {
      type: 'multi-checkbox',
      key: 'selectedIds',
      options: [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
        { label: 'Three', value: 3 },
      ],
      value: [1, 3],
    } as const satisfies IonicMultiCheckboxField<number>;

    expectTypeOf(field.type).toEqualTypeOf<'multi-checkbox'>();
  });

  it('should accept empty value array', () => {
    const field = {
      type: 'multi-checkbox',
      key: 'tags',
      options: [
        { label: 'Tag 1', value: 'tag1' },
        { label: 'Tag 2', value: 'tag2' },
      ],
      value: [],
    } as const satisfies IonicMultiCheckboxField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'multi-checkbox'>();
  });

  it('should accept custom type multi-checkbox', () => {
    interface Feature {
      id: number;
      name: string;
    }

    const field = {
      type: 'multi-checkbox',
      key: 'features',
      options: [
        { label: 'Feature A', value: { id: 1, name: 'A' } },
        { label: 'Feature B', value: { id: 2, name: 'B' } },
      ],
      value: [{ id: 1, name: 'A' }],
    } as const satisfies IonicMultiCheckboxField<Feature>;

    expectTypeOf(field.type).toEqualTypeOf<'multi-checkbox'>();
  });

  it('should accept all labelPlacement values', () => {
    const start = {
      type: 'multi-checkbox',
      key: 'm1',
      options: [],
      props: { labelPlacement: 'start' },
    } as const satisfies IonicMultiCheckboxField<string>;

    const end = {
      type: 'multi-checkbox',
      key: 'm2',
      options: [],
      props: { labelPlacement: 'end' },
    } as const satisfies IonicMultiCheckboxField<string>;

    const fixed = {
      type: 'multi-checkbox',
      key: 'm3',
      options: [],
      props: { labelPlacement: 'fixed' },
    } as const satisfies IonicMultiCheckboxField<string>;

    const stacked = {
      type: 'multi-checkbox',
      key: 'm4',
      options: [],
      props: { labelPlacement: 'stacked' },
    } as const satisfies IonicMultiCheckboxField<string>;

    expectTypeOf(start.type).toEqualTypeOf<'multi-checkbox'>();
    expectTypeOf(end.type).toEqualTypeOf<'multi-checkbox'>();
    expectTypeOf(fixed.type).toEqualTypeOf<'multi-checkbox'>();
    expectTypeOf(stacked.type).toEqualTypeOf<'multi-checkbox'>();
  });

  it('should accept all justify values', () => {
    const start = {
      type: 'multi-checkbox',
      key: 'm1',
      options: [],
      props: { justify: 'start' },
    } as const satisfies IonicMultiCheckboxField<string>;

    const end = {
      type: 'multi-checkbox',
      key: 'm2',
      options: [],
      props: { justify: 'end' },
    } as const satisfies IonicMultiCheckboxField<string>;

    const spaceBetween = {
      type: 'multi-checkbox',
      key: 'm3',
      options: [],
      props: { justify: 'space-between' },
    } as const satisfies IonicMultiCheckboxField<string>;

    expectTypeOf(start.type).toEqualTypeOf<'multi-checkbox'>();
    expectTypeOf(end.type).toEqualTypeOf<'multi-checkbox'>();
    expectTypeOf(spaceBetween.type).toEqualTypeOf<'multi-checkbox'>();
  });

  it('should accept all color values', () => {
    const primary = {
      type: 'multi-checkbox',
      key: 'm1',
      options: [],
      props: { color: 'primary' },
    } as const satisfies IonicMultiCheckboxField<string>;

    const success = {
      type: 'multi-checkbox',
      key: 'm2',
      options: [],
      props: { color: 'success' },
    } as const satisfies IonicMultiCheckboxField<string>;

    const danger = {
      type: 'multi-checkbox',
      key: 'm3',
      options: [],
      props: { color: 'danger' },
    } as const satisfies IonicMultiCheckboxField<string>;

    expectTypeOf(primary.type).toEqualTypeOf<'multi-checkbox'>();
    expectTypeOf(success.type).toEqualTypeOf<'multi-checkbox'>();
    expectTypeOf(danger.type).toEqualTypeOf<'multi-checkbox'>();
  });
});
