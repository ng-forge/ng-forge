/**
 * Exhaustive type tests for IonicTextarea field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { IonicTextareaProps, IonicTextareaField } from './ionic-textarea.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// IonicTextareaProps - Whitelist Test
// ============================================================================

describe('IonicTextareaProps - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    | 'rows'
    | 'cols'
    | 'autoGrow'
    | 'maxlength'
    | 'counter'
    | 'fill'
    | 'shape'
    | 'labelPlacement'
    | 'hint'
    | 'errorText'
    | 'color'
    | 'placeholder';
  type ActualKeys = keyof IonicTextareaProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<IonicTextareaProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('rows', () => {
      expectTypeOf<IonicTextareaProps['rows']>().toEqualTypeOf<number | undefined>();
    });

    it('cols', () => {
      expectTypeOf<IonicTextareaProps['cols']>().toEqualTypeOf<number | undefined>();
    });

    it('autoGrow', () => {
      expectTypeOf<IonicTextareaProps['autoGrow']>().toEqualTypeOf<boolean | undefined>();
    });

    it('maxlength', () => {
      expectTypeOf<IonicTextareaProps['maxlength']>().toEqualTypeOf<number | undefined>();
    });

    it('counter', () => {
      expectTypeOf<IonicTextareaProps['counter']>().toEqualTypeOf<boolean | undefined>();
    });

    it('fill', () => {
      expectTypeOf<IonicTextareaProps['fill']>().toEqualTypeOf<'solid' | 'outline' | undefined>();
    });

    it('shape', () => {
      expectTypeOf<IonicTextareaProps['shape']>().toEqualTypeOf<'round' | undefined>();
    });

    it('labelPlacement', () => {
      expectTypeOf<IonicTextareaProps['labelPlacement']>().toEqualTypeOf<'start' | 'end' | 'fixed' | 'stacked' | 'floating' | undefined>();
    });

    it('hint', () => {
      expectTypeOf<IonicTextareaProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('errorText', () => {
      expectTypeOf<IonicTextareaProps['errorText']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('color', () => {
      expectTypeOf<IonicTextareaProps['color']>().toEqualTypeOf<
        'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark' | undefined
      >();
    });

    it('placeholder', () => {
      expectTypeOf<IonicTextareaProps['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// IonicTextareaField - Whitelist Test
// ============================================================================

describe('IonicTextareaField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof IonicTextareaField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<IonicTextareaField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<IonicTextareaField['type']>().toEqualTypeOf<'textarea'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<IonicTextareaField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = IonicTextareaField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<IonicTextareaField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<IonicTextareaField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicTextareaField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicTextareaField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicTextareaField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicTextareaField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<IonicTextareaField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('email', () => {
      expectTypeOf<IonicTextareaField['email']>().toEqualTypeOf<boolean | undefined>();
    });

    it('min', () => {
      expectTypeOf<IonicTextareaField['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<IonicTextareaField['max']>().toEqualTypeOf<number | undefined>();
    });

    it('minLength', () => {
      expectTypeOf<IonicTextareaField['minLength']>().toEqualTypeOf<number | undefined>();
    });

    it('maxLength', () => {
      expectTypeOf<IonicTextareaField['maxLength']>().toEqualTypeOf<number | undefined>();
    });

    it('pattern', () => {
      expectTypeOf<IonicTextareaField['pattern']>().toEqualTypeOf<string | RegExp | undefined>();
    });

    it('validators', () => {
      expectTypeOf<IonicTextareaField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<IonicTextareaField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<IonicTextareaField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<IonicTextareaField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys from BaseValueField', () => {
    it('value is string', () => {
      expectTypeOf<IonicTextareaField['value']>().toEqualTypeOf<string | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<IonicTextareaField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// IonicTextareaField - Usage Tests
// ============================================================================

describe('IonicTextareaField - Usage Tests', () => {
  it('should accept textarea with all Ionic props', () => {
    const field = {
      type: 'textarea',
      key: 'description',
      label: 'Description',
      props: {
        rows: 5,
        cols: 40,
        autoGrow: true,
        maxlength: 500,
        counter: true,
        fill: 'solid',
        shape: 'round',
        labelPlacement: 'floating',
        hint: 'Enter a detailed description',
        errorText: 'Description is required',
        color: 'primary',
        placeholder: 'Type here...',
      },
      value: 'Sample text',
    } as const satisfies IonicTextareaField;

    expectTypeOf(field.value).toEqualTypeOf<'Sample text'>();
  });

  it('should accept textarea without props', () => {
    const field = {
      type: 'textarea',
      key: 'comments',
      value: 'My comment',
    } as const satisfies IonicTextareaField;

    expectTypeOf(field.value).toEqualTypeOf<'My comment'>();
  });

  it('should accept rows and cols', () => {
    const field = {
      type: 'textarea',
      key: 'notes',
      props: {
        rows: 10,
        cols: 50,
      },
    } as const satisfies IonicTextareaField;

    expectTypeOf(field.props?.rows).toEqualTypeOf<10>();
    expectTypeOf(field.props?.cols).toEqualTypeOf<50>();
  });

  it('should accept autoGrow', () => {
    const field = {
      type: 'textarea',
      key: 'message',
      props: {
        autoGrow: true,
      },
    } as const satisfies IonicTextareaField;

    expectTypeOf(field.props?.autoGrow).toEqualTypeOf<true>();
  });

  it('should accept maxlength and counter', () => {
    const field = {
      type: 'textarea',
      key: 'bio',
      props: {
        maxlength: 200,
        counter: true,
      },
    } as const satisfies IonicTextareaField;

    expectTypeOf(field.props?.maxlength).toEqualTypeOf<200>();
    expectTypeOf(field.props?.counter).toEqualTypeOf<true>();
  });

  it('should accept all fill values', () => {
    const solid = {
      type: 'textarea',
      key: 't1',
      props: { fill: 'solid' },
    } as const satisfies IonicTextareaField;

    const outline = {
      type: 'textarea',
      key: 't2',
      props: { fill: 'outline' },
    } as const satisfies IonicTextareaField;

    expectTypeOf(solid.type).toEqualTypeOf<'textarea'>();
    expectTypeOf(outline.type).toEqualTypeOf<'textarea'>();
  });

  it('should accept all labelPlacement values', () => {
    const start = {
      type: 'textarea',
      key: 't1',
      props: { labelPlacement: 'start' },
    } as const satisfies IonicTextareaField;

    const end = {
      type: 'textarea',
      key: 't2',
      props: { labelPlacement: 'end' },
    } as const satisfies IonicTextareaField;

    const floating = {
      type: 'textarea',
      key: 't3',
      props: { labelPlacement: 'floating' },
    } as const satisfies IonicTextareaField;

    const stacked = {
      type: 'textarea',
      key: 't4',
      props: { labelPlacement: 'stacked' },
    } as const satisfies IonicTextareaField;

    const fixed = {
      type: 'textarea',
      key: 't5',
      props: { labelPlacement: 'fixed' },
    } as const satisfies IonicTextareaField;

    expectTypeOf(start.type).toEqualTypeOf<'textarea'>();
    expectTypeOf(end.type).toEqualTypeOf<'textarea'>();
    expectTypeOf(floating.type).toEqualTypeOf<'textarea'>();
    expectTypeOf(stacked.type).toEqualTypeOf<'textarea'>();
    expectTypeOf(fixed.type).toEqualTypeOf<'textarea'>();
  });

  it('should accept all color values', () => {
    const primary = {
      type: 'textarea',
      key: 't1',
      props: { color: 'primary' },
    } as const satisfies IonicTextareaField;

    const dark = {
      type: 'textarea',
      key: 't2',
      props: { color: 'dark' },
    } as const satisfies IonicTextareaField;

    const light = {
      type: 'textarea',
      key: 't3',
      props: { color: 'light' },
    } as const satisfies IonicTextareaField;

    expectTypeOf(primary.type).toEqualTypeOf<'textarea'>();
    expectTypeOf(dark.type).toEqualTypeOf<'textarea'>();
    expectTypeOf(light.type).toEqualTypeOf<'textarea'>();
  });

  it('should accept helper and error text', () => {
    const field = {
      type: 'textarea',
      key: 'feedback',
      props: {
        hint: 'Please provide feedback',
        errorText: 'Feedback is required',
      },
    } as const satisfies IonicTextareaField;

    expectTypeOf(field.props?.hint).toEqualTypeOf<'Please provide feedback'>();
    expectTypeOf(field.props?.errorText).toEqualTypeOf<'Feedback is required'>();
  });
});
