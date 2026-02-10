/**
 * Exhaustive type tests for BsTextarea field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { BsTextareaProps, BsTextareaField } from './bs-textarea.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// BsTextareaProps - Whitelist Test
// ============================================================================

describe('BsTextareaProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'rows' | 'cols' | 'size' | 'floatingLabel' | 'hint' | 'validFeedback' | 'invalidFeedback' | 'placeholder';
  type ActualKeys = keyof BsTextareaProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<BsTextareaProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('rows', () => {
      expectTypeOf<BsTextareaProps['rows']>().toEqualTypeOf<number | undefined>();
    });

    it('cols', () => {
      expectTypeOf<BsTextareaProps['cols']>().toEqualTypeOf<number | undefined>();
    });

    it('size', () => {
      expectTypeOf<BsTextareaProps['size']>().toEqualTypeOf<'sm' | 'lg' | undefined>();
    });

    it('floatingLabel', () => {
      expectTypeOf<BsTextareaProps['floatingLabel']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hint', () => {
      expectTypeOf<BsTextareaProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('validFeedback', () => {
      expectTypeOf<BsTextareaProps['validFeedback']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('invalidFeedback', () => {
      expectTypeOf<BsTextareaProps['invalidFeedback']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsTextareaProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// BsTextareaField - Whitelist Test
// ============================================================================

describe('BsTextareaField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof BsTextareaField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<BsTextareaField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<BsTextareaField['type']>().toEqualTypeOf<'textarea'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<BsTextareaField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = BsTextareaField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<BsTextareaField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<BsTextareaField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<BsTextareaField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<BsTextareaField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<BsTextareaField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<BsTextareaField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<BsTextareaField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('maxLength (from field)', () => {
      expectTypeOf<BsTextareaField['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('validators', () => {
      expectTypeOf<BsTextareaField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<BsTextareaField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<BsTextareaField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<BsTextareaField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is string', () => {
      expectTypeOf<BsTextareaField['value']>().toEqualTypeOf<string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsTextareaField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('BsTextareaField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'textarea',
      key: 'description',
      label: 'Description',
      value: '',
      props: {
        rows: 5,
        size: 'lg',
        floatingLabel: true,
        hint: 'Enter a detailed description',
      },
    } as const satisfies BsTextareaField;

    expectTypeOf(field.type).toEqualTypeOf<'textarea'>();
    expectTypeOf(field.value).toEqualTypeOf<''>();
  });
});
