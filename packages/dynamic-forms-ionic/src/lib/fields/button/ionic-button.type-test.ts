/**
 * Exhaustive type tests for IonicButton field and specific button types.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig } from '@ng-forge/dynamic-forms';
import type { RequiredKeys } from '@ng-forge/testing';

import type {
  IonicButtonProps,
  IonicButtonField,
  IonicSubmitButtonField,
  IonicNextButtonField,
  IonicPreviousButtonField,
  AddArrayItemButtonField,
  RemoveArrayItemButtonField,
} from './ionic-button.type';

// ============================================================================
// IonicButtonProps - Whitelist Test
// ============================================================================

describe('IonicButtonProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'expand' | 'fill' | 'shape' | 'size' | 'color' | 'strong' | 'type';
  type ActualKeys = keyof IonicButtonProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<IonicButtonProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('expand', () => {
      expectTypeOf<IonicButtonProps['expand']>().toEqualTypeOf<'full' | 'block' | undefined>();
    });

    it('fill', () => {
      expectTypeOf<IonicButtonProps['fill']>().toEqualTypeOf<'clear' | 'outline' | 'solid' | 'default' | undefined>();
    });

    it('shape', () => {
      expectTypeOf<IonicButtonProps['shape']>().toEqualTypeOf<'round' | undefined>();
    });

    it('size', () => {
      expectTypeOf<IonicButtonProps['size']>().toEqualTypeOf<'small' | 'default' | 'large' | undefined>();
    });

    it('color', () => {
      expectTypeOf<IonicButtonProps['color']>().toEqualTypeOf<
        'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark' | undefined
      >();
    });

    it('strong', () => {
      expectTypeOf<IonicButtonProps['strong']>().toEqualTypeOf<boolean | undefined>();
    });

    it('type', () => {
      expectTypeOf<IonicButtonProps['type']>().toEqualTypeOf<'button' | 'submit' | 'reset' | undefined>();
    });
  });
});

// ============================================================================
// IonicSubmitButtonField - Whitelist Test
// ============================================================================

describe('IonicSubmitButtonField - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    // From FieldDef (minus event)
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
    // Explicitly defined
    | 'logic';
  type ActualKeys = keyof IonicSubmitButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<IonicSubmitButtonField['type']>().toEqualTypeOf<'submit'>();
    });

    it('key is required', () => {
      expectTypeOf<IonicSubmitButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<IonicSubmitButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('disabled', () => {
      expectTypeOf<IonicSubmitButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<IonicSubmitButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicSubmitButtonField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicSubmitButtonField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicSubmitButtonField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicSubmitButtonField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('props', () => {
      expectTypeOf<IonicSubmitButtonField['props']>().toEqualTypeOf<IonicButtonProps | undefined>();
    });

    it('logic', () => {
      expectTypeOf<IonicSubmitButtonField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });
  });
});

// ============================================================================
// IonicNextButtonField - Whitelist Test
// ============================================================================

describe('IonicNextButtonField - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    // From FieldDef (minus event)
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
    // Explicitly defined
    | 'logic';
  type ActualKeys = keyof IonicNextButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<IonicNextButtonField['type']>().toEqualTypeOf<'next'>();
    });

    it('key is required', () => {
      expectTypeOf<IonicNextButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<IonicNextButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('disabled', () => {
      expectTypeOf<IonicNextButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<IonicNextButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicNextButtonField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicNextButtonField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicNextButtonField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicNextButtonField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('props', () => {
      expectTypeOf<IonicNextButtonField['props']>().toEqualTypeOf<IonicButtonProps | undefined>();
    });

    it('logic', () => {
      expectTypeOf<IonicNextButtonField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });
  });
});

// ============================================================================
// IonicPreviousButtonField - Whitelist Test
// ============================================================================

describe('IonicPreviousButtonField - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    // From FieldDef (minus event)
    'key' | 'type' | 'label' | 'props' | 'className' | 'disabled' | 'readonly' | 'hidden' | 'tabIndex' | 'col' | 'meta';
  type ActualKeys = keyof IonicPreviousButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<IonicPreviousButtonField['type']>().toEqualTypeOf<'previous'>();
    });

    it('key is required', () => {
      expectTypeOf<IonicPreviousButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<IonicPreviousButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('disabled', () => {
      expectTypeOf<IonicPreviousButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<IonicPreviousButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<IonicPreviousButtonField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<IonicPreviousButtonField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<IonicPreviousButtonField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<IonicPreviousButtonField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('props', () => {
      expectTypeOf<IonicPreviousButtonField['props']>().toEqualTypeOf<IonicButtonProps | undefined>();
    });
  });
});

// ============================================================================
// AddArrayItemButtonField - Whitelist Test
// ============================================================================

describe('AddArrayItemButtonField - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    // From FieldDef (minus event)
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
    // Explicitly defined
    | 'arrayKey';
  type ActualKeys = keyof AddArrayItemButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<AddArrayItemButtonField['type']>().toEqualTypeOf<'addArrayItem'>();
    });

    it('key is required', () => {
      expectTypeOf<AddArrayItemButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<AddArrayItemButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('disabled', () => {
      expectTypeOf<AddArrayItemButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<AddArrayItemButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<AddArrayItemButtonField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<AddArrayItemButtonField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<AddArrayItemButtonField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<AddArrayItemButtonField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('props', () => {
      expectTypeOf<AddArrayItemButtonField['props']>().toEqualTypeOf<IonicButtonProps | undefined>();
    });

    it('arrayKey', () => {
      expectTypeOf<AddArrayItemButtonField['arrayKey']>().toEqualTypeOf<string | undefined>();
    });
  });
});

// ============================================================================
// RemoveArrayItemButtonField - Whitelist Test
// ============================================================================

describe('RemoveArrayItemButtonField - Exhaustive Whitelist', () => {
  type ExpectedKeys =
    // From FieldDef (minus event)
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
    // Explicitly defined
    | 'arrayKey';
  type ActualKeys = keyof RemoveArrayItemButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<RemoveArrayItemButtonField['type']>().toEqualTypeOf<'removeArrayItem'>();
    });

    it('key is required', () => {
      expectTypeOf<RemoveArrayItemButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<RemoveArrayItemButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('disabled', () => {
      expectTypeOf<RemoveArrayItemButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<RemoveArrayItemButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<RemoveArrayItemButtonField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<RemoveArrayItemButtonField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<RemoveArrayItemButtonField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<RemoveArrayItemButtonField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('props', () => {
      expectTypeOf<RemoveArrayItemButtonField['props']>().toEqualTypeOf<IonicButtonProps | undefined>();
    });

    it('arrayKey', () => {
      expectTypeOf<RemoveArrayItemButtonField['arrayKey']>().toEqualTypeOf<string | undefined>();
    });
  });
});

// ============================================================================
// Button Fields - Usage Tests
// ============================================================================

describe('IonicSubmitButtonField - Usage Tests', () => {
  it('should accept submit button with all props', () => {
    const field = {
      type: 'submit',
      key: 'submitBtn',
      label: 'Submit',
      disabled: false,
      className: 'submit-button',
      props: {
        expand: 'block',
        fill: 'solid',
        shape: 'round',
        size: 'large',
        color: 'primary',
        strong: true,
        type: 'submit',
      },
      logic: [],
    } as const satisfies IonicSubmitButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'submit'>();
  });

  it('should accept minimal submit button', () => {
    const field = {
      type: 'submit',
      key: 'submit',
      label: 'Submit',
    } as const satisfies IonicSubmitButtonField;

    expectTypeOf(field.label).toEqualTypeOf<'Submit'>();
  });
});

describe('IonicNextButtonField - Usage Tests', () => {
  it('should accept next button with all props', () => {
    const field = {
      type: 'next',
      key: 'nextBtn',
      label: 'Next',
      disabled: false,
      className: 'next-button',
      props: {
        expand: 'full',
        fill: 'outline',
        color: 'secondary',
        size: 'default',
      },
      logic: [],
    } as const satisfies IonicNextButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'next'>();
  });

  it('should accept minimal next button', () => {
    const field = {
      type: 'next',
      key: 'next',
      label: 'Next Page',
    } as const satisfies IonicNextButtonField;

    expectTypeOf(field.label).toEqualTypeOf<'Next Page'>();
  });
});

describe('IonicPreviousButtonField - Usage Tests', () => {
  it('should accept previous button with all props', () => {
    const field = {
      type: 'previous',
      key: 'prevBtn',
      label: 'Previous',
      disabled: false,
      className: 'prev-button',
      props: {
        fill: 'clear',
        color: 'medium',
        size: 'small',
      },
    } as const satisfies IonicPreviousButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'previous'>();
  });

  it('should accept minimal previous button', () => {
    const field = {
      type: 'previous',
      key: 'prev',
      label: 'Back',
    } as const satisfies IonicPreviousButtonField;

    expectTypeOf(field.label).toEqualTypeOf<'Back'>();
  });
});

describe('AddArrayItemButtonField - Usage Tests', () => {
  it('should accept add array item button with all props', () => {
    const field = {
      type: 'addArrayItem',
      key: 'addItem',
      label: 'Add Item',
      disabled: false,
      className: 'add-button',
      props: {
        expand: 'block',
        fill: 'solid',
        color: 'success',
      },
      arrayKey: 'items',
    } as const satisfies AddArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'addArrayItem'>();
  });

  it('should accept add button without arrayKey', () => {
    const field = {
      type: 'addArrayItem',
      key: 'add',
      label: 'Add',
    } as const satisfies AddArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'addArrayItem'>();
  });
});

describe('RemoveArrayItemButtonField - Usage Tests', () => {
  it('should accept remove array item button with all props', () => {
    const field = {
      type: 'removeArrayItem',
      key: 'removeItem',
      label: 'Remove Item',
      disabled: false,
      className: 'remove-button',
      props: {
        fill: 'outline',
        color: 'danger',
        size: 'small',
      },
      arrayKey: 'items',
    } as const satisfies RemoveArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'removeArrayItem'>();
  });

  it('should accept remove button without arrayKey', () => {
    const field = {
      type: 'removeArrayItem',
      key: 'remove',
      label: 'Delete',
    } as const satisfies RemoveArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'removeArrayItem'>();
  });
});

describe('IonicButtonProps - All Values Tests', () => {
  it('should accept all expand values', () => {
    const full = {
      type: 'submit',
      key: 'b1',
      label: 'Button',
      props: { expand: 'full' },
    } as const satisfies IonicSubmitButtonField;

    const block = {
      type: 'submit',
      key: 'b2',
      label: 'Button',
      props: { expand: 'block' },
    } as const satisfies IonicSubmitButtonField;

    expectTypeOf(full.props?.expand).toEqualTypeOf<'full'>();
    expectTypeOf(block.props?.expand).toEqualTypeOf<'block'>();
  });

  it('should accept all fill values', () => {
    const clear = {
      type: 'submit',
      key: 'b1',
      label: 'Button',
      props: { fill: 'clear' },
    } as const satisfies IonicSubmitButtonField;

    const outline = {
      type: 'submit',
      key: 'b2',
      label: 'Button',
      props: { fill: 'outline' },
    } as const satisfies IonicSubmitButtonField;

    const solid = {
      type: 'submit',
      key: 'b3',
      label: 'Button',
      props: { fill: 'solid' },
    } as const satisfies IonicSubmitButtonField;

    const defaultFill = {
      type: 'submit',
      key: 'b4',
      label: 'Button',
      props: { fill: 'default' },
    } as const satisfies IonicSubmitButtonField;

    expectTypeOf(clear.props?.fill).toEqualTypeOf<'clear'>();
    expectTypeOf(outline.props?.fill).toEqualTypeOf<'outline'>();
    expectTypeOf(solid.props?.fill).toEqualTypeOf<'solid'>();
    expectTypeOf(defaultFill.props?.fill).toEqualTypeOf<'default'>();
  });

  it('should accept all size values', () => {
    const small = {
      type: 'submit',
      key: 'b1',
      label: 'Button',
      props: { size: 'small' },
    } as const satisfies IonicSubmitButtonField;

    const defaultSize = {
      type: 'submit',
      key: 'b2',
      label: 'Button',
      props: { size: 'default' },
    } as const satisfies IonicSubmitButtonField;

    const large = {
      type: 'submit',
      key: 'b3',
      label: 'Button',
      props: { size: 'large' },
    } as const satisfies IonicSubmitButtonField;

    expectTypeOf(small.props?.size).toEqualTypeOf<'small'>();
    expectTypeOf(defaultSize.props?.size).toEqualTypeOf<'default'>();
    expectTypeOf(large.props?.size).toEqualTypeOf<'large'>();
  });

  it('should accept all color values', () => {
    const primary = {
      type: 'submit',
      key: 'b1',
      label: 'Button',
      props: { color: 'primary' },
    } as const satisfies IonicSubmitButtonField;

    const danger = {
      type: 'submit',
      key: 'b2',
      label: 'Button',
      props: { color: 'danger' },
    } as const satisfies IonicSubmitButtonField;

    const light = {
      type: 'submit',
      key: 'b3',
      label: 'Button',
      props: { color: 'light' },
    } as const satisfies IonicSubmitButtonField;

    expectTypeOf(primary.props?.color).toEqualTypeOf<'primary'>();
    expectTypeOf(danger.props?.color).toEqualTypeOf<'danger'>();
    expectTypeOf(light.props?.color).toEqualTypeOf<'light'>();
  });

  it('should accept strong property', () => {
    const field = {
      type: 'submit',
      key: 'btn',
      label: 'Button',
      props: { strong: true },
    } as const satisfies IonicSubmitButtonField;

    expectTypeOf(field.props?.strong).toEqualTypeOf<true>();
  });

  it('should accept all type values', () => {
    const button = {
      type: 'submit',
      key: 'b1',
      label: 'Button',
      props: { type: 'button' },
    } as const satisfies IonicSubmitButtonField;

    const submit = {
      type: 'submit',
      key: 'b2',
      label: 'Button',
      props: { type: 'submit' },
    } as const satisfies IonicSubmitButtonField;

    const reset = {
      type: 'submit',
      key: 'b3',
      label: 'Button',
      props: { type: 'reset' },
    } as const satisfies IonicSubmitButtonField;

    expectTypeOf(button.props?.type).toEqualTypeOf<'button'>();
    expectTypeOf(submit.props?.type).toEqualTypeOf<'submit'>();
    expectTypeOf(reset.props?.type).toEqualTypeOf<'reset'>();
  });
});
