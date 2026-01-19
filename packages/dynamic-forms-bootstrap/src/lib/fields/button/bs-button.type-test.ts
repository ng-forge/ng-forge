/**
 * Exhaustive type tests for BsButton field types.
 */
import { expectTypeOf } from 'vitest';
import type { LogicConfig } from '@ng-forge/dynamic-forms';
import type { RequiredKeys } from '@ng-forge/testing';

import type {
  BsButtonProps,
  BsSubmitButtonField,
  BsNextButtonField,
  BsPreviousButtonField,
  AddArrayItemButtonField,
  RemoveArrayItemButtonField,
} from './bs-button.type';

// ============================================================================
// BsButtonProps - Whitelist Test
// ============================================================================

describe('BsButtonProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'variant' | 'outline' | 'size' | 'block' | 'active' | 'type';
  type ActualKeys = keyof BsButtonProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys optional', () => {
    expectTypeOf<RequiredKeys<BsButtonProps>>().toEqualTypeOf<never>();
  });

  describe('property types', () => {
    it('variant', () => {
      expectTypeOf<BsButtonProps['variant']>().toEqualTypeOf<
        'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link' | undefined
      >();
    });

    it('outline', () => {
      expectTypeOf<BsButtonProps['outline']>().toEqualTypeOf<boolean | undefined>();
    });

    it('size', () => {
      expectTypeOf<BsButtonProps['size']>().toEqualTypeOf<'sm' | 'lg' | undefined>();
    });

    it('block', () => {
      expectTypeOf<BsButtonProps['block']>().toEqualTypeOf<boolean | undefined>();
    });

    it('active', () => {
      expectTypeOf<BsButtonProps['active']>().toEqualTypeOf<boolean | undefined>();
    });

    it('type', () => {
      expectTypeOf<BsButtonProps['type']>().toEqualTypeOf<'button' | 'submit' | 'reset' | undefined>();
    });
  });
});

// ============================================================================
// BsSubmitButtonField - Whitelist Test
// ============================================================================

describe('BsSubmitButtonField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof BsSubmitButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<BsSubmitButtonField['type']>().toEqualTypeOf<'submit'>();
    });

    it('key is required', () => {
      expectTypeOf<BsSubmitButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<BsSubmitButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys from FieldDef', () => {
    it('disabled', () => {
      expectTypeOf<BsSubmitButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<BsSubmitButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<BsSubmitButtonField['props']>().toEqualTypeOf<BsButtonProps | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<BsSubmitButtonField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<BsSubmitButtonField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<BsSubmitButtonField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<BsSubmitButtonField['col']>().toEqualTypeOf<number | undefined>();
    });
  });

  describe('submit-specific keys', () => {
    it('logic', () => {
      expectTypeOf<BsSubmitButtonField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });
  });
});

// ============================================================================
// BsNextButtonField - Whitelist Test
// ============================================================================

describe('BsNextButtonField - Exhaustive Whitelist', () => {
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

  type ActualKeys = keyof BsNextButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<BsNextButtonField['type']>().toEqualTypeOf<'next'>();
    });

    it('key is required', () => {
      expectTypeOf<BsNextButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<BsNextButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<BsNextButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<BsNextButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<BsNextButtonField['props']>().toEqualTypeOf<BsButtonProps | undefined>();
    });

    it('logic', () => {
      expectTypeOf<BsNextButtonField['logic']>().toEqualTypeOf<LogicConfig[] | undefined>();
    });
  });
});

// ============================================================================
// BsPreviousButtonField - Whitelist Test
// ============================================================================

describe('BsPreviousButtonField - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'key' | 'type' | 'label' | 'props' | 'className' | 'disabled' | 'readonly' | 'hidden' | 'tabIndex' | 'col' | 'meta';

  type ActualKeys = keyof BsPreviousButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<BsPreviousButtonField['type']>().toEqualTypeOf<'previous'>();
    });

    it('key is required', () => {
      expectTypeOf<BsPreviousButtonField['key']>().toEqualTypeOf<string>();
    });

    it('label is required', () => {
      expectTypeOf<BsPreviousButtonField['label']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<BsPreviousButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<BsPreviousButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<BsPreviousButtonField['props']>().toEqualTypeOf<BsButtonProps | undefined>();
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
      expectTypeOf<AddArrayItemButtonField['props']>().toEqualTypeOf<BsButtonProps | undefined>();
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
      expectTypeOf<RemoveArrayItemButtonField['props']>().toEqualTypeOf<BsButtonProps | undefined>();
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
        variant: 'primary',
        size: 'lg',
      },
    } as const satisfies BsSubmitButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'submit'>();
  });

  it('should accept valid next button configuration', () => {
    const field = {
      type: 'next',
      key: 'next',
      label: 'Next',
      props: {
        variant: 'success',
        outline: true,
      },
    } as const satisfies BsNextButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'next'>();
  });

  it('should accept valid previous button configuration', () => {
    const field = {
      type: 'previous',
      key: 'previous',
      label: 'Back',
      props: {
        variant: 'secondary',
      },
    } as const satisfies BsPreviousButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'previous'>();
  });

  it('should accept valid add array item button configuration', () => {
    const field = {
      type: 'addArrayItem',
      key: 'addItem',
      label: 'Add Item',
      arrayKey: 'items',
      props: {
        variant: 'info',
        size: 'sm',
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
        variant: 'danger',
        outline: true,
      },
    } as const satisfies RemoveArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'removeArrayItem'>();
  });
});
