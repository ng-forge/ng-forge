/**
 * Exhaustive type tests for IonicSelect field.
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

import type { IonicSelectProps, IonicSelectField } from './ionic-select.type';
import type { RequiredKeys } from '@ng-forge/dynamic-forms/testing';

// ============================================================================
// IonicSelectProps - Whitelist Test
// ============================================================================

describe('IonicSelectProps - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    | 'multiple'
    | 'interface'
    | 'interfaceOptions'
    | 'cancelText'
    | 'okText'
    | 'placeholder'
    | 'fill'
    | 'shape'
    | 'labelPlacement'
    | 'color'
    | 'compareWith';
  type ActualKeys = keyof IonicSelectProps<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<IonicSelectProps<string>>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('multiple', () => {
      expectTypeOf<IonicSelectProps<string>['multiple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('interface', () => {
      expectTypeOf<IonicSelectProps<string>['interface']>().toEqualTypeOf<'action-sheet' | 'popover' | 'alert' | undefined>();
    });

    it('interfaceOptions', () => {
      expectTypeOf<IonicSelectProps<string>['interfaceOptions']>().toEqualTypeOf<unknown | undefined>();
    });

    it('cancelText', () => {
      expectTypeOf<IonicSelectProps<string>['cancelText']>().toEqualTypeOf<string | undefined>();
    });

    it('okText', () => {
      expectTypeOf<IonicSelectProps<string>['okText']>().toEqualTypeOf<string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<IonicSelectProps<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('fill', () => {
      expectTypeOf<IonicSelectProps<string>['fill']>().toEqualTypeOf<'solid' | 'outline' | undefined>();
    });

    it('shape', () => {
      expectTypeOf<IonicSelectProps<string>['shape']>().toEqualTypeOf<'round' | undefined>();
    });

    it('labelPlacement', () => {
      expectTypeOf<IonicSelectProps<string>['labelPlacement']>().toEqualTypeOf<
        'start' | 'end' | 'fixed' | 'stacked' | 'floating' | undefined
      >();
    });

    it('color', () => {
      expectTypeOf<IonicSelectProps<string>['color']>().toEqualTypeOf<
        'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | undefined
      >();
    });

    it('compareWith', () => {
      type CompareWithType = IonicSelectProps<string>['compareWith'];
      expectTypeOf<CompareWithType>().toEqualTypeOf<((o1: string, o2: string) => boolean) | undefined>();
    });
  });

  describe('generic type parameter', () => {
    it('compareWith uses type parameter T', () => {
      interface CustomType {
        id: number;
        name: string;
      }

      type CompareWithType = IonicSelectProps<CustomType>['compareWith'];
      expectTypeOf<CompareWithType>().toEqualTypeOf<((o1: CustomType, o2: CustomType) => boolean) | undefined>();
    });
  });
});

// ============================================================================
// IonicSelectField - Whitelist Test
// ============================================================================

describe('IonicSelectField - Exhaustive Whitelist', () => {
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
    | 'schemas'
    // From BaseValueField
    | 'value'
    | 'placeholder'
    // From SelectField
    | 'options';

  type ActualKeys = keyof IonicSelectField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<IonicSelectField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<IonicSelectField<string>['type']>().toEqualTypeOf<'select'>();
    });

    it('options is required and readonly', () => {
      type OptionsType = IonicSelectField<string>['options'];
      expectTypeOf<OptionsType>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<IonicSelectField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = IonicSelectField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<IonicSelectField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<IonicSelectField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicSelectField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicSelectField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicSelectField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicSelectField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<IonicSelectField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<IonicSelectField<string>['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<IonicSelectField<string>['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<IonicSelectField<string>['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<IonicSelectField<string>['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<IonicSelectField<string>['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<IonicSelectField<string>['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<IonicSelectField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<IonicSelectField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<IonicSelectField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<IonicSelectField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys from BaseValueField', () => {
    it('value type matches generic parameter', () => {
      expectTypeOf<IonicSelectField<string>['value']>().toEqualTypeOf<string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<IonicSelectField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('generic type parameter', () => {
    it('value type is number when T is number', () => {
      expectTypeOf<IonicSelectField<number>['value']>().toEqualTypeOf<number | undefined>();
    });

    it('options type matches generic parameter', () => {
      expectTypeOf<IonicSelectField<number>['options']>().toEqualTypeOf<readonly FieldOption<number>[]>();
    });
  });
});

// ============================================================================
// IonicSelectField - Usage Tests
// ============================================================================

describe('IonicSelectField - Usage Tests', () => {
  it('should accept string select with Ionic props', () => {
    const field = {
      type: 'select',
      key: 'country',
      label: 'Select Country',
      options: [
        { label: 'USA', value: 'us' },
        { label: 'Canada', value: 'ca' },
      ],
      props: {
        multiple: false,
        interface: 'action-sheet',
        fill: 'solid',
        shape: 'round',
        labelPlacement: 'floating',
        color: 'primary',
        placeholder: 'Choose a country',
        cancelText: 'Cancel',
        okText: 'OK',
      },
      value: 'us',
    } as const satisfies IonicSelectField<string>;

    expectTypeOf(field.value).toEqualTypeOf<'us'>();
  });

  it('should accept number select', () => {
    const field = {
      type: 'select',
      key: 'rating',
      options: [
        { label: 'One Star', value: 1 },
        { label: 'Two Stars', value: 2 },
      ],
      value: 1,
    } as const satisfies IonicSelectField<number>;

    expectTypeOf(field.value).toEqualTypeOf<1>();
  });

  it('should accept custom type with compareWith', () => {
    interface User {
      id: number;
      name: string;
    }

    const field = {
      type: 'select',
      key: 'user',
      options: [
        { label: 'John', value: { id: 1, name: 'John' } },
        { label: 'Jane', value: { id: 2, name: 'Jane' } },
      ],
      props: {
        compareWith: (o1: User, o2: User) => o1.id === o2.id,
      },
      value: { id: 1, name: 'John' },
    } as const satisfies IonicSelectField<User>;

    expectTypeOf(field.value).toEqualTypeOf<{ readonly id: 1; readonly name: 'John' }>();
  });

  it('should accept all Ionic interface options', () => {
    const actionSheet = {
      type: 'select',
      key: 'choice1',
      options: [],
      props: { interface: 'action-sheet' },
    } as const satisfies IonicSelectField<string>;

    const popover = {
      type: 'select',
      key: 'choice2',
      options: [],
      props: { interface: 'popover' },
    } as const satisfies IonicSelectField<string>;

    const alert = {
      type: 'select',
      key: 'choice3',
      options: [],
      props: { interface: 'alert' },
    } as const satisfies IonicSelectField<string>;

    expectTypeOf(actionSheet.type).toEqualTypeOf<'select'>();
    expectTypeOf(popover.type).toEqualTypeOf<'select'>();
    expectTypeOf(alert.type).toEqualTypeOf<'select'>();
  });
});
