/**
 * Exhaustive type tests for PrimeButton field types.
 */
import { expectTypeOf } from 'vitest';
import type { LogicConfig } from '@ng-forge/dynamic-forms';
import type { RequiredKeys } from '@ng-forge/utils';

import type {
  PrimeButtonProps,
  PrimeSubmitButtonField,
  PrimeNextButtonField,
  PrimePreviousButtonField,
  AddArrayItemButtonField,
  RemoveArrayItemButtonField,
} from './prime-button.type';

// ============================================================================
// PrimeButtonProps - Whitelist Test
// ============================================================================

describe('PrimeButtonProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'severity' | 'text' | 'outlined' | 'raised' | 'rounded' | 'icon' | 'iconPos' | 'type';
  type ActualKeys = keyof PrimeButtonProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<PrimeButtonProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('severity', () => {
      expectTypeOf<PrimeButtonProps['severity']>().toEqualTypeOf<
        'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast' | undefined
      >();
    });

    it('text', () => {
      expectTypeOf<PrimeButtonProps['text']>().toEqualTypeOf<boolean | undefined>();
    });

    it('outlined', () => {
      expectTypeOf<PrimeButtonProps['outlined']>().toEqualTypeOf<boolean | undefined>();
    });

    it('raised', () => {
      expectTypeOf<PrimeButtonProps['raised']>().toEqualTypeOf<boolean | undefined>();
    });

    it('rounded', () => {
      expectTypeOf<PrimeButtonProps['rounded']>().toEqualTypeOf<boolean | undefined>();
    });

    it('icon', () => {
      expectTypeOf<PrimeButtonProps['icon']>().toEqualTypeOf<string | undefined>();
    });

    it('iconPos', () => {
      expectTypeOf<PrimeButtonProps['iconPos']>().toEqualTypeOf<'left' | 'right' | 'top' | 'bottom' | undefined>();
    });

    it('type', () => {
      expectTypeOf<PrimeButtonProps['type']>().toEqualTypeOf<'button' | 'submit' | 'reset' | undefined>();
    });
  });
});

// ============================================================================
// PrimeSubmitButtonField - Whitelist Test
// ============================================================================

describe('PrimeSubmitButtonField - Exhaustive Whitelist', () => {
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
    | 'logic';

  type ActualKeys = keyof PrimeSubmitButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<PrimeSubmitButtonField['type']>().toEqualTypeOf<'submit'>();
    });

    it('key is required', () => {
      expectTypeOf<PrimeSubmitButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<PrimeSubmitButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('disabled', () => {
      expectTypeOf<PrimeSubmitButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<PrimeSubmitButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<PrimeSubmitButtonField['props']>().toEqualTypeOf<PrimeButtonProps | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<PrimeSubmitButtonField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<PrimeSubmitButtonField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<PrimeSubmitButtonField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<PrimeSubmitButtonField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('submit-specific keys', () => {
    it('logic', () => {
      expectTypeOf<PrimeSubmitButtonField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });
  });
});

// ============================================================================
// PrimeNextButtonField - Whitelist Test
// ============================================================================

describe('PrimeNextButtonField - Exhaustive Whitelist', () => {
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
    | 'logic';

  type ActualKeys = keyof PrimeNextButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<PrimeNextButtonField['type']>().toEqualTypeOf<'next'>();
    });

    it('key is required', () => {
      expectTypeOf<PrimeNextButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<PrimeNextButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<PrimeNextButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<PrimeNextButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<PrimeNextButtonField['props']>().toEqualTypeOf<PrimeButtonProps | undefined>();
    });

    it('logic', () => {
      expectTypeOf<PrimeNextButtonField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });
  });
});

// ============================================================================
// PrimePreviousButtonField - Whitelist Test
// ============================================================================

describe('PrimePreviousButtonField - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'key' | 'type' | 'label' | 'props' | 'className' | 'disabled' | 'readonly' | 'hidden' | 'tabIndex' | 'col' | 'meta';

  type ActualKeys = keyof PrimePreviousButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<PrimePreviousButtonField['type']>().toEqualTypeOf<'previous'>();
    });

    it('key is required', () => {
      expectTypeOf<PrimePreviousButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<PrimePreviousButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<PrimePreviousButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<PrimePreviousButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<PrimePreviousButtonField['props']>().toEqualTypeOf<PrimeButtonProps | undefined>();
    });
  });
});

// ============================================================================
// AddArrayItemButtonField - Whitelist Test
// ============================================================================

describe('AddArrayItemButtonField - Exhaustive Whitelist', () => {
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

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<AddArrayItemButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<AddArrayItemButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<AddArrayItemButtonField['props']>().toEqualTypeOf<PrimeButtonProps | undefined>();
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

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<RemoveArrayItemButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<RemoveArrayItemButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<RemoveArrayItemButtonField['props']>().toEqualTypeOf<PrimeButtonProps | undefined>();
    });

    it('arrayKey', () => {
      expectTypeOf<RemoveArrayItemButtonField['arrayKey']>().toEqualTypeOf<string | undefined>();
    });
  });
});

// ============================================================================
// Usage Tests
// ============================================================================

describe('Button Fields - Usage', () => {
  it('should accept valid submit button configuration', () => {
    const field = {
      type: 'submit',
      key: 'submit',
      label: 'Submit',
      props: {
        severity: 'primary',
        raised: true,
      },
    } as const satisfies PrimeSubmitButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'submit'>();
  });

  it('should accept valid next button configuration', () => {
    const field = {
      type: 'next',
      key: 'next',
      label: 'Next',
      props: {
        severity: 'success',
        outlined: true,
      },
    } as const satisfies PrimeNextButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'next'>();
  });

  it('should accept valid previous button configuration', () => {
    const field = {
      type: 'previous',
      key: 'previous',
      label: 'Back',
      props: {
        severity: 'secondary',
        text: true,
      },
    } as const satisfies PrimePreviousButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'previous'>();
  });

  it('should accept valid add array item button configuration', () => {
    const field = {
      type: 'addArrayItem',
      key: 'addItem',
      label: 'Add Item',
      arrayKey: 'items',
      props: {
        severity: 'info',
        icon: 'pi pi-plus',
        iconPos: 'left',
      },
    } as const satisfies AddArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'addArrayItem'>();
  });

  it('should accept valid remove array item button configuration', () => {
    const field = {
      type: 'removeArrayItem',
      key: 'removeItem',
      label: 'Remove',
      arrayKey: 'items',
      props: {
        severity: 'danger',
        icon: 'pi pi-trash',
        rounded: true,
      },
    } as const satisfies RemoveArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'removeArrayItem'>();
  });

  it('should accept button with all severity values', () => {
    const primary = { type: 'submit', key: 's1', label: 'Test', props: { severity: 'primary' } } as const satisfies PrimeSubmitButtonField;
    const secondary = {
      type: 'submit',
      key: 's2',
      label: 'Test',
      props: { severity: 'secondary' },
    } as const satisfies PrimeSubmitButtonField;
    const success = { type: 'submit', key: 's3', label: 'Test', props: { severity: 'success' } } as const satisfies PrimeSubmitButtonField;
    const info = { type: 'submit', key: 's4', label: 'Test', props: { severity: 'info' } } as const satisfies PrimeSubmitButtonField;
    const warn = { type: 'submit', key: 's5', label: 'Test', props: { severity: 'warn' } } as const satisfies PrimeSubmitButtonField;
    const danger = { type: 'submit', key: 's6', label: 'Test', props: { severity: 'danger' } } as const satisfies PrimeSubmitButtonField;
    const help = { type: 'submit', key: 's7', label: 'Test', props: { severity: 'help' } } as const satisfies PrimeSubmitButtonField;
    const contrast = {
      type: 'submit',
      key: 's8',
      label: 'Test',
      props: { severity: 'contrast' },
    } as const satisfies PrimeSubmitButtonField;

    expectTypeOf(primary.type).toEqualTypeOf<'submit'>();
    expectTypeOf(secondary.type).toEqualTypeOf<'submit'>();
    expectTypeOf(success.type).toEqualTypeOf<'submit'>();
    expectTypeOf(info.type).toEqualTypeOf<'submit'>();
    expectTypeOf(warn.type).toEqualTypeOf<'submit'>();
    expectTypeOf(danger.type).toEqualTypeOf<'submit'>();
    expectTypeOf(help.type).toEqualTypeOf<'submit'>();
    expectTypeOf(contrast.type).toEqualTypeOf<'submit'>();
  });

  it('should accept button with all icon positions', () => {
    const left = { type: 'submit', key: 's1', label: 'Test', props: { iconPos: 'left' } } as const satisfies PrimeSubmitButtonField;
    const right = { type: 'submit', key: 's2', label: 'Test', props: { iconPos: 'right' } } as const satisfies PrimeSubmitButtonField;
    const top = { type: 'submit', key: 's3', label: 'Test', props: { iconPos: 'top' } } as const satisfies PrimeSubmitButtonField;
    const bottom = { type: 'submit', key: 's4', label: 'Test', props: { iconPos: 'bottom' } } as const satisfies PrimeSubmitButtonField;

    expectTypeOf(left.props?.iconPos).toEqualTypeOf<'left'>();
    expectTypeOf(right.props?.iconPos).toEqualTypeOf<'right'>();
    expectTypeOf(top.props?.iconPos).toEqualTypeOf<'top'>();
    expectTypeOf(bottom.props?.iconPos).toEqualTypeOf<'bottom'>();
  });
});
