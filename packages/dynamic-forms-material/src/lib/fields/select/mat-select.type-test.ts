/**
 * Exhaustive type tests for MatSelect field.
 */
import { expectTypeOf } from 'vitest';
import type { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import type {
  DynamicText,
  FieldOption,
  LogicConfig,
  SchemaApplicationConfig,
  ValidatorConfig,
  ValidationMessages,
} from '@ng-forge/dynamic-forms';

import type { MatSelectProps, MatSelectField } from './mat-select.type';

// ============================================================================
// Type Utilities
// ============================================================================

type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

// ============================================================================
// MatSelectProps - Whitelist Test
// ============================================================================

describe('MatSelectProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'appearance' | 'multiple' | 'panelMaxHeight' | 'subscriptSizing' | 'compareWith' | 'hint' | 'placeholder';
  type ActualKeys = keyof MatSelectProps<unknown>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<MatSelectProps<unknown>>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('appearance', () => {
      expectTypeOf<MatSelectProps<unknown>['appearance']>().toEqualTypeOf<MatFormFieldAppearance | undefined>();
    });

    it('multiple', () => {
      expectTypeOf<MatSelectProps<unknown>['multiple']>().toEqualTypeOf<boolean | undefined>();
    });

    it('panelMaxHeight', () => {
      expectTypeOf<MatSelectProps<unknown>['panelMaxHeight']>().toEqualTypeOf<string | undefined>();
    });

    it('subscriptSizing', () => {
      expectTypeOf<MatSelectProps<unknown>['subscriptSizing']>().toEqualTypeOf<SubscriptSizing | undefined>();
    });

    it('compareWith (generic)', () => {
      type Expected = ((o1: string, o2: string) => boolean) | undefined;
      expectTypeOf<MatSelectProps<string>['compareWith']>().toEqualTypeOf<Expected>();
    });

    it('hint', () => {
      expectTypeOf<MatSelectProps<unknown>['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatSelectProps<unknown>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// MatSelectField - Whitelist Test
// ============================================================================

describe('MatSelectField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof MatSelectField<string>;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<MatSelectField<string>['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<MatSelectField<string>['type']>().toEqualTypeOf<'select'>();
    });

    it('options is required', () => {
      expectTypeOf<MatSelectField<string>['options']>().toEqualTypeOf<readonly FieldOption<string>[]>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<MatSelectField<string>['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = MatSelectField<string>['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<MatSelectField<string>['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<MatSelectField<string>['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<MatSelectField<string>['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<MatSelectField<string>['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<MatSelectField<string>['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<MatSelectField<string>['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<MatSelectField<string>['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<MatSelectField<string>['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<MatSelectField<string>['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<MatSelectField<string>['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<MatSelectField<string>['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is generic type', () => {
      expectTypeOf<MatSelectField<string>['value']>().toEqualTypeOf<string | undefined>();
      expectTypeOf<MatSelectField<number>['value']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatSelectField<string>['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('MatSelectField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'select',
      key: 'country',
      label: 'Country',
      options: [
        { label: 'USA', value: 'us' },
        { label: 'Canada', value: 'ca' },
      ],
      props: {
        appearance: 'outline',
        multiple: false,
      },
    } as const satisfies MatSelectField<string>;

    expectTypeOf(field.type).toEqualTypeOf<'select'>();
    expectTypeOf(field.options).toMatchTypeOf<readonly FieldOption<string>[]>();
  });

  it('should preserve generic type for value and options', () => {
    const field = {
      type: 'select',
      key: 'count',
      options: [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
      ],
      value: 1,
    } as const satisfies MatSelectField<number>;

    expectTypeOf(field.value).toEqualTypeOf<1>();
  });
});
