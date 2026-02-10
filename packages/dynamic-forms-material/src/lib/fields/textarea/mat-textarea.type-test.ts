/**
 * Exhaustive type tests for MatTextarea field.
 */
import { expectTypeOf } from 'vitest';
import type { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { MatTextareaProps, MatTextareaField } from './mat-textarea.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// MatTextareaProps - Whitelist Test
// ============================================================================

describe('MatTextareaProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'hint' | 'appearance' | 'subscriptSizing' | 'rows' | 'cols' | 'resize' | 'maxLength' | 'placeholder';
  type ActualKeys = keyof MatTextareaProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<MatTextareaProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('hint', () => {
      expectTypeOf<MatTextareaProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('appearance', () => {
      expectTypeOf<MatTextareaProps['appearance']>().toEqualTypeOf<MatFormFieldAppearance | undefined>();
    });

    it('subscriptSizing', () => {
      expectTypeOf<MatTextareaProps['subscriptSizing']>().toEqualTypeOf<SubscriptSizing | undefined>();
    });

    it('rows', () => {
      expectTypeOf<MatTextareaProps['rows']>().toEqualTypeOf<number | undefined>();
    });

    it('cols', () => {
      expectTypeOf<MatTextareaProps['cols']>().toEqualTypeOf<number | undefined>();
    });

    it('resize', () => {
      expectTypeOf<MatTextareaProps['resize']>().toEqualTypeOf<'none' | 'both' | 'horizontal' | 'vertical' | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<MatTextareaProps['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatTextareaProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// MatTextareaField - Whitelist Test
// ============================================================================

describe('MatTextareaField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof MatTextareaField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<MatTextareaField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<MatTextareaField['type']>().toEqualTypeOf<'textarea'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<MatTextareaField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = MatTextareaField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<MatTextareaField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<MatTextareaField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<MatTextareaField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<MatTextareaField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<MatTextareaField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<MatTextareaField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<MatTextareaField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('maxLength (from field)', () => {
      expectTypeOf<MatTextareaField['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('validators', () => {
      expectTypeOf<MatTextareaField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<MatTextareaField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<MatTextareaField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<MatTextareaField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is string', () => {
      expectTypeOf<MatTextareaField['value']>().toEqualTypeOf<string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatTextareaField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('MatTextareaField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'textarea',
      key: 'description',
      label: 'Description',
      value: '',
      props: {
        appearance: 'outline',
        rows: 5,
        resize: 'vertical',
      },
    } as const satisfies MatTextareaField;

    expectTypeOf(field.type).toEqualTypeOf<'textarea'>();
    expectTypeOf(field.value).toEqualTypeOf<''>();
  });
});
