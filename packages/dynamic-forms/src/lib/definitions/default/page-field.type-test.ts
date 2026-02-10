/**
 * Exhaustive type tests for PageField and ContainerLogicConfig types.
 */
import { expectTypeOf } from 'vitest';
import type { PageField } from './page-field';
import type { ContainerLogicConfig } from '../base/container-logic-config';
import type { ConditionalExpression } from '../../models/expressions/conditional-expression';
import type { PageAllowedChildren } from '../../models/types/nesting-constraints';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// ContainerLogicConfig - Whitelist Test
// ============================================================================

describe('ContainerLogicConfig - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type' | 'condition';
  type ActualKeys = keyof ContainerLogicConfig;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  it('should have all keys required', () => {
    expectTypeOf<RequiredKeys<ContainerLogicConfig>>().toEqualTypeOf<'type' | 'condition'>();
  });

  describe('property types', () => {
    it('type is literal hidden', () => {
      expectTypeOf<ContainerLogicConfig['type']>().toEqualTypeOf<'hidden'>();
    });

    it('condition', () => {
      expectTypeOf<ContainerLogicConfig['condition']>().toEqualTypeOf<ConditionalExpression | boolean>();
    });
  });
});

// ============================================================================
// PageField - Whitelist Test
// ============================================================================

describe('PageField - Exhaustive Whitelist', () => {
  // PageField extends FieldDef<never> and adds: fields, label?: never, logic?, meta?: never
  // From FieldDef: key, type, label, props, className, disabled, readonly, hidden, tabIndex, col, meta
  // Note: 'meta' is overridden to 'never' because containers don't have native form elements
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
    | 'fields'
    | 'logic';

  type ActualKeys = keyof PageField;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('key is required', () => {
      expectTypeOf<PageField['key']>().toEqualTypeOf<string>();
    });

    it('type is required and literal', () => {
      expectTypeOf<PageField['type']>().toEqualTypeOf<'page'>();
    });

    it('fields is required', () => {
      type PageRequiredKeys = RequiredKeys<PageField>;
      expectTypeOf<'fields'>().toMatchTypeOf<PageRequiredKeys>();
    });
  });

  describe('optional keys', () => {
    it('label is never (pages do not have labels)', () => {
      expectTypeOf<PageField['label']>().toEqualTypeOf<never | undefined>();
    });

    it('props is never', () => {
      expectTypeOf<PageField['props']>().toEqualTypeOf<never | undefined>();
    });

    it('meta is never (pages have no native form element)', () => {
      expectTypeOf<PageField['meta']>().toEqualTypeOf<never | undefined>();
    });

    it('className', () => {
      expectTypeOf<PageField['className']>().toEqualTypeOf<string | undefined>();
    });

    it('disabled', () => {
      expectTypeOf<PageField['disabled']>().toEqualTypeOf<boolean | undefined>();
    });

    it('readonly', () => {
      expectTypeOf<PageField['readonly']>().toEqualTypeOf<boolean | undefined>();
    });

    it('hidden', () => {
      expectTypeOf<PageField['hidden']>().toEqualTypeOf<boolean | undefined>();
    });

    it('tabIndex', () => {
      expectTypeOf<PageField['tabIndex']>().toEqualTypeOf<number | undefined>();
    });

    it('col', () => {
      expectTypeOf<PageField['col']>().toEqualTypeOf<number | undefined>();
    });

    it('logic', () => {
      expectTypeOf<PageField['logic']>().toEqualTypeOf<ContainerLogicConfig[] | undefined>();
    });
  });

  describe('fields property', () => {
    it('fields accepts PageAllowedChildren array', () => {
      type FieldsType = PageField['fields'];
      expectTypeOf<FieldsType>().toMatchTypeOf<readonly PageAllowedChildren[]>();
    });
  });
});

// ============================================================================
// PageField - Usage Tests
// ============================================================================

describe('PageField - Usage Tests', () => {
  it('should accept minimal page definition', () => {
    const page = {
      key: 'page1',
      type: 'page',
      fields: [],
    } as const satisfies PageField;

    expectTypeOf(page.type).toEqualTypeOf<'page'>();
  });

  it('should accept page with logic configuration', () => {
    const page = {
      key: 'conditionalPage',
      type: 'page',
      fields: [],
      logic: [
        {
          type: 'hidden',
          condition: true,
        },
      ],
    } as const satisfies PageField;

    expectTypeOf(page.logic).not.toBeUndefined();
  });

  it('should accept page with conditional expression', () => {
    const page = {
      key: 'dynamicPage',
      type: 'page',
      fields: [],
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'notEquals',
            value: 'business',
          } as ConditionalExpression,
        },
      ],
    } as const satisfies PageField;

    expectTypeOf(page.type).toEqualTypeOf<'page'>();
  });

  it('should accept page with className', () => {
    const page = {
      key: 'styledPage',
      type: 'page',
      fields: [],
      className: 'page-container',
    } as const satisfies PageField;

    expectTypeOf(page.className).toEqualTypeOf<'page-container'>();
  });
});
