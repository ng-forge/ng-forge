/**
 * Exhaustive type tests for BsSelect field.
 */
import { describe, it, expectTypeOf } from 'vitest';
import type {
  DynamicText,
  FieldOption,
  LogicConfig,
  SchemaApplicationConfig,
  ValidatorConfig,
  ValidationMessages,
} from '@ng-forge/dynamic-forms';

import type { BsSelectProps, BsSelectField } from './bs-select.type';

// ============================================================================
// Type Utilities
// ============================================================================

type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

// ============================================================================
// BsSelectProps - Whitelist Test
// ============================================================================

describe('BsSelectProps - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    | 'multiple'
    | 'size'
    | 'htmlSize'
    | 'floatingLabel'
    | 'helpText'
    | 'validFeedback'
    | 'invalidFeedback'
    | 'compareWith'
    | 'placeholder';
  type ActualKeys = keyof BsSelectProps<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<BsSelectProps<string>>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('multiple', () => {
      expectTypeOf<BsSelectProps<string>['multiple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('size', () => {
      expectTypeOf<BsSelectProps<string>['size']>().toEqualTypeOf<'sm' | 'lg' | undefined>();
    });

    it('htmlSize', () => {
      expectTypeOf<BsSelectProps<string>['htmlSize']>().toEqualTypeOf<number | undefined>();
    });

    it('floatingLabel', () => {
      expectTypeOf<BsSelectProps<string>['floatingLabel']>().toEqualTypeOf<boolean | undefined>();
    });

    it('helpText', () => {
      expectTypeOf<BsSelectProps<string>['helpText']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('validFeedback', () => {
      expectTypeOf<BsSelectProps<string>['validFeedback']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('invalidFeedback', () => {
      expectTypeOf<BsSelectProps<string>['invalidFeedback']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('compareWith', () => {
      expectTypeOf<BsSelectProps<string>['compareWith']>().toEqualTypeOf<((o1: string, o2: string) => boolean) | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsSelectProps<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// BsSelectField - Whitelist Test
// ============================================================================

describe('BsSelectField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof BsSelectField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<BsSelectField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<BsSelectField<string>['type']>().toEqualTypeOf<'select'>();
    });

    it('options is required', () => {
      expectTypeOf<BsSelectField<string>['options']>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<BsSelectField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = BsSelectField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<BsSelectField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<BsSelectField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<BsSelectField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<BsSelectField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<BsSelectField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<BsSelectField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<BsSelectField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<BsSelectField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<BsSelectField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<BsSelectField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<BsSelectField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is generic type', () => {
      expectTypeOf<BsSelectField<string>['value']>().toEqualTypeOf<string | undefined>();
      expectTypeOf<BsSelectField<number>['value']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsSelectField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('BsSelectField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'select',
      key: 'country',
      label: 'Country',
      options: [
        { label: 'USA', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'Mexico', value: 'mx' },
      ],
      props: {
        size: 'lg',
        floatingLabel: true,
        helpText: 'Select your country',
      },
    } as const satisfies BsSelectField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'select'>();
  });

  it('should preserve generic type for value and options', () => {
    const field: BsSelectField<number> = {
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
