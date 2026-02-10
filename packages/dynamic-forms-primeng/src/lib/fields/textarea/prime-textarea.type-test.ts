/**
 * Exhaustive type tests for PrimeTextarea field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { PrimeTextareaProps, PrimeTextareaField } from './prime-textarea.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// PrimeTextareaProps - Whitelist Test
// ============================================================================

describe('PrimeTextareaProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'rows' | 'cols' | 'autoResize' | 'maxlength' | 'styleClass' | 'hint' | 'placeholder';
  type ActualKeys = keyof PrimeTextareaProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<PrimeTextareaProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('rows', () => {
      expectTypeOf<PrimeTextareaProps['rows']>().toEqualTypeOf<number | undefined>();
    });

    it('cols', () => {
      expectTypeOf<PrimeTextareaProps['cols']>().toEqualTypeOf<number | undefined>();
    });

    it('autoResize', () => {
      expectTypeOf<PrimeTextareaProps['autoResize']>().toEqualTypeOf<boolean | undefined>();
    });

    it('maxlength', () => {
      expectTypeOf<PrimeTextareaProps['maxlength']>().toEqualTypeOf<number | undefined>();
    });

    it('styleClass', () => {
      expectTypeOf<PrimeTextareaProps['styleClass']>().toEqualTypeOf<string | undefined>();
    });

    it('hint', () => {
      expectTypeOf<PrimeTextareaProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeTextareaProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// PrimeTextareaField - Whitelist Test
// ============================================================================

describe('PrimeTextareaField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof PrimeTextareaField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<PrimeTextareaField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<PrimeTextareaField['type']>().toEqualTypeOf<'textarea'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<PrimeTextareaField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = PrimeTextareaField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<PrimeTextareaField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<PrimeTextareaField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<PrimeTextareaField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<PrimeTextareaField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<PrimeTextareaField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<PrimeTextareaField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<PrimeTextareaField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<PrimeTextareaField['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<PrimeTextareaField['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<PrimeTextareaField['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<PrimeTextareaField['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<PrimeTextareaField['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<PrimeTextareaField['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<PrimeTextareaField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<PrimeTextareaField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<PrimeTextareaField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<PrimeTextareaField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is string', () => {
      expectTypeOf<PrimeTextareaField['value']>().toEqualTypeOf<string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<PrimeTextareaField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('PrimeTextareaField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'textarea',
      key: 'comments',
      label: 'Comments',
      value: 'Some text',
      props: {
        rows: 5,
        autoResize: true,
        maxlength: 500,
        styleClass: 'custom-textarea',
        hint: 'Enter your comments',
      },
    } as const satisfies PrimeTextareaField;

    expectTypeOf(field.type).toEqualTypeOf<'textarea'>();
    expectTypeOf(field.value).toEqualTypeOf<'Some text'>();
  });
});
