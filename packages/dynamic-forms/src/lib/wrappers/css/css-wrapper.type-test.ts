/**
 * Exhaustive type tests for CssWrapper type.
 */
import { expectTypeOf } from 'vitest';
import type { CssWrapper } from './css-wrapper.type';
import type { DynamicText } from '../../models/types/dynamic-text';
import type { RequiredKeys } from '@ng-forge/utils';

// ============================================================================
// CssWrapper - Whitelist Test
// ============================================================================

describe('CssWrapper - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type' | 'cssClasses';
  type ActualKeys = keyof CssWrapper;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      type CssWrapperRequiredKeys = RequiredKeys<CssWrapper>;
      expectTypeOf<'type'>().toMatchTypeOf<CssWrapperRequiredKeys>();
      expectTypeOf<CssWrapper['type']>().toEqualTypeOf<'css'>();
    });
  });

  describe('optional keys', () => {
    it('cssClasses is optional DynamicText', () => {
      expectTypeOf<CssWrapper['cssClasses']>().toEqualTypeOf<DynamicText | undefined>();
    });
  });
});

// ============================================================================
// CssWrapper - Usage Tests
// ============================================================================

describe('CssWrapper - Usage Tests', () => {
  it('should accept minimal config with only type', () => {
    const config = {
      type: 'css',
    } as const satisfies CssWrapper;

    expectTypeOf(config.type).toEqualTypeOf<'css'>();
  });

  it('should accept config with string cssClasses', () => {
    const config = {
      type: 'css',
      cssClasses: 'my-class another-class',
    } as const satisfies CssWrapper;

    expectTypeOf(config.cssClasses).toEqualTypeOf<'my-class another-class'>();
  });

  it('should accept config with DynamicText cssClasses', () => {
    const config: CssWrapper = {
      type: 'css',
      cssClasses: 'dynamic-class',
    };

    expectTypeOf(config.cssClasses).toEqualTypeOf<DynamicText | undefined>();
  });
});
