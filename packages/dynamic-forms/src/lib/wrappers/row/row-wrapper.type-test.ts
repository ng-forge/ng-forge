/**
 * Exhaustive type tests for RowWrapper type.
 */
import { expectTypeOf } from 'vitest';
import type { RowWrapper } from './row-wrapper.type';
import type { RequiredKeys } from '@ng-forge/utils';

describe('RowWrapper - Exhaustive Whitelist', () => {
  type ExpectedKeys = 'type';
  type ActualKeys = keyof RowWrapper;

  it('should have exactly the expected keys', () => {
    expectTypeOf<ActualKeys>().toEqualTypeOf<ExpectedKeys>();
  });

  describe('required keys', () => {
    it('type is required and literal', () => {
      type RowWrapperRequiredKeys = RequiredKeys<RowWrapper>;
      expectTypeOf<'type'>().toMatchTypeOf<RowWrapperRequiredKeys>();
      expectTypeOf<RowWrapper['type']>().toEqualTypeOf<'row'>();
    });
  });
});

describe('RowWrapper - Usage Tests', () => {
  it('should accept minimal config with only type', () => {
    const config = {
      type: 'row',
    } as const satisfies RowWrapper;

    expectTypeOf(config.type).toEqualTypeOf<'row'>();
  });
});
