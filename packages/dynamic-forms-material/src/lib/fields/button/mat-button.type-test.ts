/**
 * Exhaustive type tests for MatButton field types.
 */
import { expectTypeOf } from 'vitest';
import type { RequiredKeys } from '@ng-forge/utils';

// Import registry augmentation to include Material field types in ArrayAllowedChildren
import '../../types/registry-augmentation';

import type {
  MatButtonProps,
  MatSubmitButtonField,
  MatNextButtonField,
  MatPreviousButtonField,
  MatAddArrayItemButtonField,
  MatRemoveArrayItemButtonField,
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
// ============================================================================

describe('MatSubmitButtonField - Exhaustive Whitelist', () => {
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
    // Value exclusion config
    | 'excludeValueIfHidden'
    | 'excludeValueIfDisabled'
    | 'excludeValueIfReadonly'
    | 'validateWhenHidden'
    | 'wrappers'
    | 'skipAutoWrappers'
    | 'skipDefaultWrappers'
    | 'addons'
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
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<MatSubmitButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('className', () => {
      expectTypeOf<MatSubmitButtonField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('props', () => {
      expectTypeOf<MatSubmitButtonField['props']>().toEqualTypeOf<MatButtonProps | undefined>();
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
    // Value exclusion config
    | 'excludeValueIfHidden'
    | 'excludeValueIfDisabled'
    | 'excludeValueIfReadonly'
    | 'validateWhenHidden'
    | 'wrappers'
    | 'skipAutoWrappers'
    | 'skipDefaultWrappers'
    | 'addons'
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
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<MatNextButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('props', () => {
      expectTypeOf<MatNextButtonField['props']>().toEqualTypeOf<MatButtonProps | undefined>();
    });
  });
});

// ============================================================================
// MatPreviousButtonField - Whitelist Test
// ============================================================================

describe('MatPreviousButtonField - Exhaustive Whitelist', () => {
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
    // Value exclusion config
    | 'excludeValueIfHidden'
    | 'excludeValueIfDisabled'
    | 'excludeValueIfReadonly'
    | 'validateWhenHidden'
    | 'wrappers'
    | 'skipAutoWrappers'
    | 'skipDefaultWrappers'
    | 'addons'
    | 'logic';

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
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<MatPreviousButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('props', () => {
      expectTypeOf<MatPreviousButtonField['props']>().toEqualTypeOf<MatButtonProps | undefined>();
    });
  });
});

// ============================================================================
// MatAddArrayItemButtonField - Whitelist Test
// ============================================================================

describe('MatAddArrayItemButtonField - Exhaustive Whitelist', () => {
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
    // Value exclusion config
    | 'excludeValueIfHidden'
    | 'excludeValueIfDisabled'
    | 'excludeValueIfReadonly'
    | 'validateWhenHidden'
    | 'wrappers'
    | 'skipAutoWrappers'
    | 'skipDefaultWrappers'
    | 'addons'
    | 'logic'
    | 'arrayKey'
    | 'template';

  type ActualKeys = keyof MatAddArrayItemButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<MatAddArrayItemButtonField['type']>().toEqualTypeOf<'add-array-item' | 'addArrayItem'>();
    });

    it('key is required', () => {
      expectTypeOf<MatAddArrayItemButtonField['key']>().toEqualTypeOf<string>();
    });

    it('template is required', () => {
      expectTypeOf<MatAddArrayItemButtonField['template']>().not.toEqualTypeOf<undefined>();
    });
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<MatAddArrayItemButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('props', () => {
      expectTypeOf<MatAddArrayItemButtonField['props']>().toEqualTypeOf<MatButtonProps | undefined>();
    });
  });
});

// ============================================================================
// MatRemoveArrayItemButtonField - Whitelist Test
// ============================================================================

describe('MatRemoveArrayItemButtonField - Exhaustive Whitelist', () => {
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
    // Value exclusion config
    | 'excludeValueIfHidden'
    | 'excludeValueIfDisabled'
    | 'excludeValueIfReadonly'
    | 'validateWhenHidden'
    | 'wrappers'
    | 'skipAutoWrappers'
    | 'skipDefaultWrappers'
    | 'addons'
    | 'logic'
    | 'arrayKey';

  type ActualKeys = keyof MatRemoveArrayItemButtonField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      expectTypeOf<MatRemoveArrayItemButtonField['type']>().toEqualTypeOf<'remove-array-item' | 'removeArrayItem'>();
    });

    it('key is required', () => {
      expectTypeOf<MatRemoveArrayItemButtonField['key']>().toEqualTypeOf<string>();
    });
  });

  describe('optional keys', () => {
    it('disabled', () => {
      expectTypeOf<MatRemoveArrayItemButtonField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('props', () => {
      expectTypeOf<MatRemoveArrayItemButtonField['props']>().toEqualTypeOf<MatButtonProps | undefined>();
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
      template: [{ key: 'name', type: 'input' }],
    } as const satisfies MatAddArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'addArrayItem'>();
  });

  it('should accept valid remove array item button configuration', () => {
    const field = {
      type: 'removeArrayItem',
      key: 'removeItem',
      label: 'Remove',
      arrayKey: 'items',
    } as const satisfies MatRemoveArrayItemButtonField;

    expectTypeOf(field.type).toEqualTypeOf<'removeArrayItem'>();
  });
});
