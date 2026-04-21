import { describe, it, expect } from 'vitest';
import { isSameWrapperChain, resolveWrappers } from './resolve-wrappers';
import { WrapperConfig } from '../../models/wrapper-type';
import { FieldDef } from '../../definitions/base/field-def';

type TestField = Pick<FieldDef<unknown>, 'type' | 'wrappers' | 'skipAutoWrappers' | 'skipDefaultWrappers'>;

/**
 * Shorthand: build an auto-association map from `{ fieldType: [wrapperNames] }`.
 * Mirrors what the WRAPPER_AUTO_ASSOCIATIONS provider constructs at registration.
 */
function autoAssoc(entries: Record<string, readonly string[]>): Map<string, WrapperConfig[]> {
  const map = new Map<string, WrapperConfig[]>();
  for (const [fieldType, wrapperNames] of Object.entries(entries)) {
    map.set(
      fieldType,
      wrapperNames.map((name) => ({ type: name }) as WrapperConfig),
    );
  }
  return map;
}

describe('resolveWrappers', () => {
  it('returns an empty chain for a bare field with no defaults and no auto-associations', () => {
    const field: TestField = { type: 'input' };

    expect(resolveWrappers(field, undefined, autoAssoc({}))).toEqual([]);
  });

  it('returns the field-level wrappers unchanged when no defaults and no auto', () => {
    const fieldWrappers: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'a' } as WrapperConfig];
    const field: TestField = { type: 'input', wrappers: fieldWrappers };

    const result = resolveWrappers(field, undefined, autoAssoc({}));

    expect(result).toEqual(fieldWrappers);
  });

  it('returns an empty chain when field.wrappers === null (explicit opt-out)', () => {
    const field: TestField = { type: 'input', wrappers: null };
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'should-not-apply' } as WrapperConfig];

    const result = resolveWrappers(field, defaults, autoAssoc({ input: ['row'] }));

    expect(result).toEqual([]);
  });

  it('field.wrappers === [] does NOT opt out — defaults + auto still apply', () => {
    const field: TestField = { type: 'input', wrappers: [] };
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];

    const result = resolveWrappers(field, defaults, autoAssoc({ input: ['auto-input'] }));

    expect(result).toEqual([{ type: 'auto-input' }, { type: 'css', cssClasses: 'default' }]);
  });

  it('applies defaultWrappers when field.wrappers is undefined', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];
    const field: TestField = { type: 'input' };

    const result = resolveWrappers(field, defaults, autoAssoc({}));

    expect(result).toEqual(defaults);
  });

  it('merges auto-associations (outermost), defaults, then field-level wrappers (innermost)', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];
    const fieldWrappers: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'field-specific' } as WrapperConfig];
    const field: TestField = { type: 'input', wrappers: fieldWrappers };

    const result = resolveWrappers(field, defaults, autoAssoc({ input: ['auto-input'], select: ['auto-select'] }));

    expect(result).toEqual([{ type: 'auto-input' }, { type: 'css', cssClasses: 'default' }, { type: 'css', cssClasses: 'field-specific' }]);
  });

  it('skips auto-associations that do not target the field type', () => {
    const field: TestField = { type: 'input' };

    const result = resolveWrappers(field, undefined, autoAssoc({ input: ['matches'], checkbox: ['does-not-match'] }));

    expect(result).toEqual([{ type: 'matches' }]);
  });

  it('returns the same reference for every empty-chain call (for ref-stable memoization)', () => {
    const first = resolveWrappers({ type: 'input' }, undefined, autoAssoc({}));
    const second = resolveWrappers({ type: 'input', wrappers: null }, undefined, autoAssoc({ input: ['ignored'] }));

    expect(first).toBe(second);
    expect(first).toEqual([]);
  });

  it('skipAutoWrappers drops the auto layer but keeps defaults + field-level', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'card' } as WrapperConfig];
    const field: TestField = {
      type: 'input',
      skipAutoWrappers: true,
      wrappers: [{ type: 'field-specific' } as WrapperConfig],
    };

    const result = resolveWrappers(field, defaults, autoAssoc({ input: ['validation'] }));

    expect(result).toEqual([{ type: 'card' }, { type: 'field-specific' }]);
  });

  it('skipDefaultWrappers drops the defaults layer but keeps auto + field-level', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'card' } as WrapperConfig];
    const field: TestField = {
      type: 'input',
      skipDefaultWrappers: true,
      wrappers: [{ type: 'field-specific' } as WrapperConfig],
    };

    const result = resolveWrappers(field, defaults, autoAssoc({ input: ['validation'] }));

    expect(result).toEqual([{ type: 'validation' }, { type: 'field-specific' }]);
  });

  it('both skip flags together with no field wrappers produces an empty chain', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'card' } as WrapperConfig];
    const field: TestField = {
      type: 'input',
      skipAutoWrappers: true,
      skipDefaultWrappers: true,
    };

    expect(resolveWrappers(field, defaults, autoAssoc({ input: ['validation'] }))).toEqual([]);
  });

  it('wrappers: null beats the skip flags — bare is bare', () => {
    const field: TestField = {
      type: 'input',
      wrappers: null,
      skipAutoWrappers: false,
      skipDefaultWrappers: false,
    };

    expect(resolveWrappers(field, [{ type: 'card' } as WrapperConfig], autoAssoc({ input: ['validation'] }))).toEqual([]);
  });
});

describe('isSameWrapperChain', () => {
  it('is true when both chains are empty', () => {
    expect(isSameWrapperChain([], [])).toBe(true);
  });

  it('is true when chains share references element-wise', () => {
    const w: WrapperConfig = { type: 'css', cssClasses: 'a' } as WrapperConfig;
    expect(isSameWrapperChain([w], [w])).toBe(true);
  });

  it('is false when lengths differ', () => {
    const w: WrapperConfig = { type: 'css' } as WrapperConfig;
    expect(isSameWrapperChain([w], [w, w])).toBe(false);
  });

  it('is false when any element differs by reference (even if structurally equal)', () => {
    const a: WrapperConfig = { type: 'css', cssClasses: 'x' } as WrapperConfig;
    const b: WrapperConfig = { type: 'css', cssClasses: 'x' } as WrapperConfig;
    expect(isSameWrapperChain([a], [b])).toBe(false);
  });
});
