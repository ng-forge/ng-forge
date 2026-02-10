/**
 * Exhaustive type tests for TextField, TextProps, and TextElementType types.
 */
import { expectTypeOf } from 'vitest';
import type { TextField, TextProps, TextElementType } from './text-field';
import type { DynamicText } from '../../models/types/dynamic-text';
import type { NonFieldLogicConfig } from '../../core/logic/non-field-logic-resolver';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// TextElementType - Whitelist Test
// ============================================================================

describe('TextElementType - Exhaustive Whitelist', () => {
  type ExpectedValues = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';

  it('should have exactly the expected values', () => {
    expectTypeOf<TextElementType>().toEqualTypeOf<ExpectedValues>();
  });

  it('should accept p', () => {
    const element: TextElementType = 'p';
    expectTypeOf(element).toMatchTypeOf<TextElementType>();
  });

  it('should accept h1', () => {
    const element: TextElementType = 'h1';
    expectTypeOf(element).toMatchTypeOf<TextElementType>();
  });

  it('should accept h2', () => {
    const element: TextElementType = 'h2';
    expectTypeOf(element).toMatchTypeOf<TextElementType>();
  });

  it('should accept h3', () => {
    const element: TextElementType = 'h3';
    expectTypeOf(element).toMatchTypeOf<TextElementType>();
  });

  it('should accept h4', () => {
    const element: TextElementType = 'h4';
    expectTypeOf(element).toMatchTypeOf<TextElementType>();
  });

  it('should accept h5', () => {
    const element: TextElementType = 'h5';
    expectTypeOf(element).toMatchTypeOf<TextElementType>();
  });

  it('should accept h6', () => {
    const element: TextElementType = 'h6';
    expectTypeOf(element).toMatchTypeOf<TextElementType>();
  });

  it('should accept span', () => {
    const element: TextElementType = 'span';
    expectTypeOf(element).toMatchTypeOf<TextElementType>();
  });
});

// ============================================================================
// TextProps - Whitelist Test
// ============================================================================

describe('TextProps - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'elementType';
  type ActualKeys = keyof TextProps;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have elementType as required', () => {
    expectTypeOf<RequiredKeys<TextProps>>().toEqualTypeOf<'elementType'>();
  });

  it('elementType is TextElementType', () => {
    expectTypeOf<TextProps['elementType']>().toEqualTypeOf<TextElementType>();
  });
});

// ============================================================================
// TextField - Whitelist Test
// ============================================================================

describe('TextField - Exhaustive Whitelist', () => {
  // TextField extends FieldDef<TextProps> and adds: logic
  // From FieldDef: key, type, label, props, className, disabled, readonly, hidden, tabIndex, col
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
    | 'logic';

  type ActualKeys = keyof TextField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<TextField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<TextField['type']>().toEqualTypeOf<'text'>();
    });
  });

  describe('optional keys', () => {
    it('label', () => {
      expectTypeOf<TextField['label']>().toEqualTypeOf<DynamicText | undefined>();
    });

    it('props', () => {
      expectTypeOf<TextField['props']>().toEqualTypeOf<TextProps | undefined>();
    });

    it('className', () => {
      expectTypeOf<TextField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<TextField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<TextField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<TextField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<TextField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<TextField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('logic', () => {
      expectTypeOf<TextField['logic']>().toEqualTypeOf<NonFieldLogicConfig[] | undefined>();
    });
  });
});

// ============================================================================
// TextField - Usage Tests
// ============================================================================

describe('TextField - Usage Tests', () => {
  it('should accept minimal text field definition', () => {
    const field = {
      key: 'intro',
      type: 'text',
    } as const satisfies TextField;

    expectTypeOf(field.type).toEqualTypeOf<'text'>();
  });

  it('should accept text field with label', () => {
    const field = {
      key: 'welcome',
      type: 'text',
      label: 'Welcome to our form',
    } as const satisfies TextField;

    expectTypeOf(field.label).toEqualTypeOf<'Welcome to our form'>();
  });

  it('should accept text field with props', () => {
    const field = {
      key: 'heading',
      type: 'text',
      label: 'Section Title',
      props: {
        elementType: 'h2',
      },
    } as const satisfies TextField;

    expectTypeOf(field.props).not.toBeUndefined();
    expectTypeOf(field.props!.elementType).toEqualTypeOf<'h2'>();
  });

  it('should accept all element types in props', () => {
    const p = { key: 't1', type: 'text', props: { elementType: 'p' } } as const satisfies TextField;
    const h1 = { key: 't2', type: 'text', props: { elementType: 'h1' } } as const satisfies TextField;
    const h2 = { key: 't3', type: 'text', props: { elementType: 'h2' } } as const satisfies TextField;
    const h3 = { key: 't4', type: 'text', props: { elementType: 'h3' } } as const satisfies TextField;
    const h4 = { key: 't5', type: 'text', props: { elementType: 'h4' } } as const satisfies TextField;
    const h5 = { key: 't6', type: 'text', props: { elementType: 'h5' } } as const satisfies TextField;
    const h6 = { key: 't7', type: 'text', props: { elementType: 'h6' } } as const satisfies TextField;
    const span = { key: 't8', type: 'text', props: { elementType: 'span' } } as const satisfies TextField;

    expectTypeOf(p.type).toEqualTypeOf<'text'>();
    expectTypeOf(h1.type).toEqualTypeOf<'text'>();
    expectTypeOf(h2.type).toEqualTypeOf<'text'>();
    expectTypeOf(h3.type).toEqualTypeOf<'text'>();
    expectTypeOf(h4.type).toEqualTypeOf<'text'>();
    expectTypeOf(h5.type).toEqualTypeOf<'text'>();
    expectTypeOf(h6.type).toEqualTypeOf<'text'>();
    expectTypeOf(span.type).toEqualTypeOf<'text'>();
  });

  it('should accept text field with logic', () => {
    const field = {
      key: 'conditionalText',
      type: 'text',
      label: 'Conditional message',
      logic: [
        {
          type: 'hidden',
          condition: true,
        },
      ],
    } as const satisfies TextField;

    expectTypeOf(field.logic).not.toBeUndefined();
  });

  it('should accept text field with className', () => {
    const field = {
      key: 'styledText',
      type: 'text',
      label: 'Styled text',
      className: 'text-primary',
    } as const satisfies TextField;

    expectTypeOf(field.className).toEqualTypeOf<'text-primary'>();
  });

  it('should accept text field with col sizing', () => {
    const field = {
      key: 'sizedText',
      type: 'text',
      label: 'Half width text',
      col: 6,
    } as const satisfies TextField;

    expectTypeOf(field.col).toEqualTypeOf<6>();
  });
});
