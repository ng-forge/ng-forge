/**
 * Exhaustive type tests for IonicInput field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { IonicInputProps, IonicInputField } from './ionic-input.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// IonicInputProps - Whitelist Test
// ============================================================================

describe('IonicInputProps - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    | 'fill'
    | 'shape'
    | 'labelPlacement'
    | 'color'
    | 'hint'
    | 'errorText'
    | 'counter'
    | 'maxlength'
    | 'clearInput'
    | 'type'
    | 'placeholder';
  type ActualKeys = keyof IonicInputProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<IonicInputProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('fill', () => {
      expectTypeOf<IonicInputProps['fill']>().toEqualTypeOf<'solid' | 'outline' | undefined>();
    });

    it('shape', () => {
      expectTypeOf<IonicInputProps['shape']>().toEqualTypeOf<'round' | undefined>();
    });

    it('labelPlacement', () => {
      expectTypeOf<IonicInputProps['labelPlacement']>().toEqualTypeOf<'start' | 'end' | 'fixed' | 'stacked' | 'floating' | undefined>();
    });

    it('color', () => {
      expectTypeOf<IonicInputProps['color']>().toEqualTypeOf<
        'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark' | undefined
      >();
    });

    it('hint', () => {
      expectTypeOf<IonicInputProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('errorText', () => {
      expectTypeOf<IonicInputProps['errorText']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('counter', () => {
      expectTypeOf<IonicInputProps['counter']>().toEqualTypeOf<boolean | undefined>();
    });

    it('maxlength', () => {
      expectTypeOf<IonicInputProps['maxlength']>().toEqualTypeOf<number | undefined>();
    });

    it('clearInput', () => {
      expectTypeOf<IonicInputProps['clearInput']>().toEqualTypeOf<boolean | undefined>();
    });

    it('type', () => {
      expectTypeOf<IonicInputProps['type']>().toEqualTypeOf<'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<IonicInputProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// IonicInputField (String) - Whitelist Test
// ============================================================================

describe('IonicInputField (String) - Exhaustive Whitelist', () => {
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
    | 'placeholder';

  // String input field (without props.type: 'number')
  type StringInputField = Extract<IonicInputField, { props?: { type?: 'text' | 'email' | 'password' | 'tel' | 'url' } }>;
  type ActualKeys = keyof StringInputField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<StringInputField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<StringInputField['type']>().toEqualTypeOf<'input'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<StringInputField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = StringInputField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<StringInputField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<StringInputField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<StringInputField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<StringInputField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<StringInputField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<StringInputField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<StringInputField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<StringInputField['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<StringInputField['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<StringInputField['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<StringInputField['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<StringInputField['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<StringInputField['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<StringInputField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<StringInputField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<StringInputField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<StringInputField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys from BaseValueField', () => {
    it('value is string for string input', () => {
      expectTypeOf<StringInputField['value']>().toEqualTypeOf<string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<StringInputField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// IonicInputField (Number) - Whitelist Test
// ============================================================================

describe('IonicInputField (Number) - Exhaustive Whitelist', () => {
  type ExpectedKeys =
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
    | 'value'
    | 'placeholder';

  // Number input field (with props.type: 'number')
  type NumberInputField = Extract<IonicInputField, { props: { type: 'number' } }>;
  type ActualKeys = keyof NumberInputField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<NumberInputField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<NumberInputField['type']>().toEqualTypeOf<'input'>();
    });

    it('props is required for number input', () => {
      expectTypeOf<NumberInputField['props']>().toMatchTypeOf<{ type: 'number' }>();
    });
  });

  describe('value type', () => {
    it('value is number for number input', () => {
      expectTypeOf<NumberInputField['value']>().toEqualTypeOf<number | undefined>();
    });
  });
});

// ============================================================================
// IonicInputField - Discriminated Union
// ============================================================================

describe('IonicInputField - Discriminated Union', () => {
  it('should accept string value when props.type is text', () => {
    const field = {
      type: 'input',
      key: 'username',
      props: { type: 'text' },
      value: 'hello',
    } as const satisfies IonicInputField;

    expectTypeOf(field.value).toEqualTypeOf<'hello'>();
  });

  it('should accept number value when props.type is number', () => {
    const field = {
      type: 'input',
      key: 'age',
      props: { type: 'number' },
      value: 25,
    } as const satisfies IonicInputField;

    expectTypeOf(field.value).toEqualTypeOf<25>();
  });

  it('should accept string value when props is omitted', () => {
    const field = {
      type: 'input',
      key: 'name',
      value: 'test',
    } as const satisfies IonicInputField;

    expectTypeOf(field.value).toEqualTypeOf<'test'>();
  });

  it('should accept Ionic-specific props', () => {
    const field = {
      type: 'input',
      key: 'email',
      props: {
        type: 'email',
        fill: 'solid',
        shape: 'round',
        labelPlacement: 'floating',
        color: 'primary',
        hint: 'Enter your email',
        errorText: 'Invalid email',
        counter: true,
        maxlength: 50,
        clearInput: true,
      },
    } as const satisfies IonicInputField;

    expectTypeOf(field.type).toEqualTypeOf<'input'>();
  });
});
