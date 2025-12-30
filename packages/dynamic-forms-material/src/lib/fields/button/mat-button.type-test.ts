/**
 * Exhaustive type tests for MatButton field types.
 */
import { expectTypeOf } from 'vitest';
import type { DynamicText, LogicConfig } from '@ng-forge/dynamic-forms';
import type { RequiredKeys } from '@ng-forge/dynamic-forms/testing';

import type {
  MatButtonProps,
  MatSubmitButtonField,
  MatNextButtonField,
  MatPreviousButtonField,
  AddArrayItemButtonField,
  RemoveArrayItemButtonField,
} from './mat-button.type';

// ============================================================================
// MatButtonProps - Whitelist Test
// ============================================================================

describe('MatButtonProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'color' | 'type';
  type ActualKeys = keyof MatButtonProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<MatButtonProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('color', () => {
      expectTypeOf<MatButtonProps['color']>().toEqualTypeOf<'primary' | 'accent' | 'warn' | undefined>();
    });

    it('type', () => {
      expectTypeOf<MatButtonProps['type']>().toEqualTypeOf<'button' | 'submit' | 'reset' | undefined>();
    });
  });
});

// ============================================================================
// MatSubmitButtonField - Whitelist Test
// Extends Omit<FieldDef<MatButtonProps>, 'event'> plus additional fields
// ============================================================================

describe('MatSubmitButtonField - Exhaustive Whitelist', () => {
  // FieldDef keys (minus 'event') + submit-specific keys
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
    // Submit-specific
    | 'logic';

  type ActualKeys = keyof MatSubmitButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<MatSubmitButtonField['type']>().toEqualTypeOf<'submit'>();
    });

    it('key is required', () => {
      expectTypeOf<MatSubmitButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<MatSubmitButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('disabled', () => {
      expectTypeOf<MatSubmitButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<MatSubmitButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<MatSubmitButtonField['props']>().toEqualTypeOf<MatButtonProps | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<MatSubmitButtonField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<MatSubmitButtonField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<MatSubmitButtonField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<MatSubmitButtonField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('submit-specific keys', () => {
    it('logic', () => {
      expectTypeOf<MatSubmitButtonField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });
  });
});

// ============================================================================
// MatNextButtonField - Whitelist Test
// ============================================================================

describe('MatNextButtonField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof MatNextButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<MatNextButtonField['type']>().toEqualTypeOf<'next'>();
    });

    it('key is required', () => {
      expectTypeOf<MatNextButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<MatNextButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<MatNextButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<MatNextButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<MatNextButtonField['props']>().toEqualTypeOf<MatButtonProps | undefined>();
    });

    it('logic', () => {
      expectTypeOf<MatNextButtonField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });
  });
});

// ============================================================================
// MatPreviousButtonField - Whitelist Test
// ============================================================================

describe('MatPreviousButtonField - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'key' | 'type' | 'label' | 'props' | 'className' | 'disabled' | 'readonly' | 'hidden' | 'tabIndex' | 'col' | 'meta';

  type ActualKeys = keyof MatPreviousButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<MatPreviousButtonField['type']>().toEqualTypeOf<'previous'>();
    });

    it('key is required', () => {
      expectTypeOf<MatPreviousButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<MatPreviousButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<MatPreviousButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<MatPreviousButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<MatPreviousButtonField['props']>().toEqualTypeOf<MatButtonProps | undefined>();
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
      expectTypeOf<AddArrayItemButtonField['props']>().toEqualTypeOf<MatButtonProps | undefined>();
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
      expectTypeOf<RemoveArrayItemButtonField['props']>().toEqualTypeOf<MatButtonProps | undefined>();
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
        color: 'primary',
      },
    } as const satisfies MatSubmitButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'submit'>();
  });

  it('should accept valid next button configuration', () => {
    const field = {
      type: 'next',
      key: 'next',
      label: 'Next',
      props: {
        color: 'accent',
      },
    } as const satisfies MatNextButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'next'>();
  });

  it('should accept valid previous button configuration', () => {
    const field = {
      type: 'previous',
      key: 'previous',
      label: 'Back',
    } as const satisfies MatPreviousButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'previous'>();
  });

  it('should accept valid add array item button configuration', () => {
    const field = {
      type: 'addArrayItem',
      key: 'addItem',
      label: 'Add Item',
      arrayKey: 'items',
    } as const satisfies AddArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'addArrayItem'>();
  });

  it('should accept valid remove array item button configuration', () => {
    const field = {
      type: 'removeArrayItem',
      key: 'removeItem',
      label: 'Remove',
      arrayKey: 'items',
    } as const satisfies RemoveArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'removeArrayItem'>();
  });
});
