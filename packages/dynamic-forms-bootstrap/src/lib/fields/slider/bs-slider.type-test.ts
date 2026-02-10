/**
 * Exhaustive type tests for BsSlider field.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { BsSliderProps, BsSliderField } from './bs-slider.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// BsSliderProps - Whitelist Test
// ============================================================================

describe('BsSliderProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'showValue' | 'valuePrefix' | 'valueSuffix' | 'hint' | 'min' | 'max' | 'step';
  type ActualKeys = keyof BsSliderProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<BsSliderProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('showValue', () => {
      expectTypeOf<BsSliderProps['showValue']>().toEqualTypeOf<boolean | undefined>();
    });

    it('valuePrefix', () => {
      expectTypeOf<BsSliderProps['valuePrefix']>().toEqualTypeOf<string | undefined>();
    });

    it('valueSuffix', () => {
      expectTypeOf<BsSliderProps['valueSuffix']>().toEqualTypeOf<string | undefined>();
    });

    it('hint', () => {
      expectTypeOf<BsSliderProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('min', () => {
      expectTypeOf<BsSliderProps['min']>().toEqualTypeOf<number | undefined>();
    });

    it('max', () => {
      expectTypeOf<BsSliderProps['max']>().toEqualTypeOf<number | undefined>();
    });

    it('step', () => {
      expectTypeOf<BsSliderProps['step']>().toEqualTypeOf<number | undefined>();
    });
  });
});

// ============================================================================
// BsSliderField - Whitelist Test
// ============================================================================

describe('BsSliderField - Exhaustive Whitelist', () => {
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
    // From SliderField
    | 'minValue'
    | 'maxValue'
    | 'step';

  type ActualKeys = keyof BsSliderField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<BsSliderField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<BsSliderField['type']>().toEqualTypeOf<'slider'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<BsSliderField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = BsSliderField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<BsSliderField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<BsSliderField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<BsSliderField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<BsSliderField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<BsSliderField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<BsSliderField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<BsSliderField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<BsSliderField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<BsSliderField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<BsSliderField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<BsSliderField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is number', () => {
      expectTypeOf<BsSliderField['value']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<BsSliderField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('slider-specific keys', () => {
    it('minValue', () => {
      expectTypeOf<BsSliderField['minValue']>().toEqualTypeOf<number | undefined>();
    });

    it('maxValue', () => {
      expectTypeOf<BsSliderField['maxValue']>().toEqualTypeOf<number | undefined>();
    });

    it('step', () => {
      expectTypeOf<BsSliderField['step']>().toEqualTypeOf<number | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('BsSliderField - Usage', () => {
  it('should accept valid field configuration', () => {
    const field = {
      type: 'slider',
      key: 'volume',
      label: 'Volume',
      value: 50,
      minValue: 0,
      maxValue: 100,
      step: 5,
      props: {
        showValue: true,
        valueSuffix: '%',
        hint: 'Adjust the volume',
      },
    } as const satisfies BsSliderField;

    expectTypeOf(field.type).toEqualTypeOf<'slider'>();
    expectTypeOf(field.value).toEqualTypeOf<50>();
  });
});
