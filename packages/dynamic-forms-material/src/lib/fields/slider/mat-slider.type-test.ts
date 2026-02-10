/**
 * Exhaustive type tests for MatSlider field.
 */
import { expectTypeOf } from 'vitest';
import type { MatFormFieldAppearance } from '@angular/material/form-field';
import type { DynamicText, LogicConfig, SchemaApplicationConfig, ValidatorConfig, ValidationMessages } from '@ng-forge/dynamic-forms';

import type { MatSliderProps, MatSliderField } from './mat-slider.type';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// MatSliderProps - Whitelist Test
// ============================================================================

describe('MatSliderProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'hint' | 'color' | 'appearance' | 'thumbLabel' | 'showThumbLabel' | 'tickInterval' | 'step';
  type ActualKeys = keyof MatSliderProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<MatSliderProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('hint', () => {
      expectTypeOf<MatSliderProps['hint']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('color', () => {
      expectTypeOf<MatSliderProps['color']>().toEqualTypeOf<'primary' | 'accent' | 'warn' | undefined>();
    });

    it('appearance', () => {
      expectTypeOf<MatSliderProps['appearance']>().toEqualTypeOf<MatFormFieldAppearance | undefined>();
    });

    it('thumbLabel', () => {
      expectTypeOf<MatSliderProps['thumbLabel']>().toEqualTypeOf<boolean | undefined>();
    });

    it('showThumbLabel', () => {
      expectTypeOf<MatSliderProps['showThumbLabel']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tickInterval', () => {
      expectTypeOf<MatSliderProps['tickInterval']>().toEqualTypeOf<number | 'auto' | undefined>();
    });

    it('step', () => {
      expectTypeOf<MatSliderProps['step']>().toEqualTypeOf<number | undefined>();
    });
  });
});

// ============================================================================
// MatSliderField - Whitelist Test
// ============================================================================

describe('MatSliderField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof MatSliderField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<MatSliderField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<MatSliderField['type']>().toEqualTypeOf<'slider'>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('label', () => {
      expectTypeOf<MatSliderField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      type PropsType = MatSliderField['props'];
      expectTypeOf<undefined>().toMatchTypeOf<PropsType>();
    });

    it('className', () => {
      expectTypeOf<MatSliderField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<MatSliderField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<MatSliderField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<MatSliderField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<MatSliderField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<MatSliderField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('validation keys from FieldWithValidation', () => {
    it('required', () => {
      expectTypeOf<MatSliderField['required']>().toEqualTypeOf<boolean | undefined>();
    });

    it('validators', () => {
      expectTypeOf<MatSliderField['validators']>().toEqualTypeOf<ValidatorConfig[] | undefined>();
    });

    it('validationMessages', () => {
      expectTypeOf<MatSliderField['validationMessages']>().toEqualTypeOf<ValidationMessages | undefined>();
    });

    it('logic', () => {
      expectTypeOf<MatSliderField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });

    it('schemas', () => {
      expectTypeOf<MatSliderField['schemas']>().toEqualTypeOf<SchemaApplicationConfig[] | undefined>();
    });
  });

  describe('value field keys', () => {
    it('value is number', () => {
      expectTypeOf<MatSliderField['value']>().toEqualTypeOf<number | undefined>();
    });

    it('placeholder', () => {
      expectTypeOf<MatSliderField['placeholder']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });

  describe('slider-specific keys', () => {
    it('minValue', () => {
      expectTypeOf<MatSliderField['minValue']>().toEqualTypeOf<number | undefined>();
    });

    it('maxValue', () => {
      expectTypeOf<MatSliderField['maxValue']>().toEqualTypeOf<number | undefined>();
    });

    it('step', () => {
      expectTypeOf<MatSliderField['step']>().toEqualTypeOf<number | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('MatSliderField - Usage', () => {
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
        color: 'primary',
        thumbLabel: true,
        tickInterval: 'auto',
      },
    } as const satisfies MatSliderField;

    expectTypeOf(field.type).toEqualTypeOf<'slider'>();
    expectTypeOf(field.value).toEqualTypeOf<50>();
  });
});
