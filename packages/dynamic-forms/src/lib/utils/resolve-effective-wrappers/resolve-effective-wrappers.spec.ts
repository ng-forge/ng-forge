import { describe, it, expect } from 'vitest';
import { resolveEffectiveWrappers } from './resolve-effective-wrappers';
import { WrapperConfig } from '../../models/wrapper-type';
import { FieldDef } from '../../definitions/base/field-def';

type TestField = Pick<FieldDef<unknown>, 'type' | 'wrappers'>;

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

describe('resolveEffectiveWrappers', () => {
  it('returns an empty chain for a bare field with no defaults and no auto-associations', () => {
    const field: TestField = { type: 'input' };

    expect(resolveEffectiveWrappers(field, undefined, autoAssoc({}))).toEqual([]);
  });

  it('returns the field-level wrappers unchanged when no defaults and no auto', () => {
    const fieldWrappers: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'a' } as WrapperConfig];
    const field: TestField = { type: 'input', wrappers: fieldWrappers };

    const result = resolveEffectiveWrappers(field, undefined, autoAssoc({}));

    expect(result).toEqual(fieldWrappers);
  });

  it('returns an empty chain when field.wrappers === null (explicit opt-out)', () => {
    const field: TestField = { type: 'input', wrappers: null };
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'should-not-apply' } as WrapperConfig];

    const result = resolveEffectiveWrappers(field, defaults, autoAssoc({ input: ['row'] }));

    expect(result).toEqual([]);
  });

  it('field.wrappers === [] does NOT opt out — defaults + auto still apply', () => {
    const field: TestField = { type: 'input', wrappers: [] };
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];

    const result = resolveEffectiveWrappers(field, defaults, autoAssoc({ input: ['auto-input'] }));

    expect(result).toEqual([{ type: 'auto-input' }, { type: 'css', cssClasses: 'default' }]);
  });

  it('applies defaultWrappers when field.wrappers is undefined', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];
    const field: TestField = { type: 'input' };

    const result = resolveEffectiveWrappers(field, defaults, autoAssoc({}));

    expect(result).toEqual(defaults);
  });

  it('merges auto-associations (outermost), defaults, then field-level wrappers (innermost)', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];
    const fieldWrappers: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'field-specific' } as WrapperConfig];
    const field: TestField = { type: 'input', wrappers: fieldWrappers };

    const result = resolveEffectiveWrappers(field, defaults, autoAssoc({ input: ['auto-input'], select: ['auto-select'] }));

    expect(result).toEqual([{ type: 'auto-input' }, { type: 'css', cssClasses: 'default' }, { type: 'css', cssClasses: 'field-specific' }]);
  });

  it('skips auto-associations that do not target the field type', () => {
    const field: TestField = { type: 'input' };

    const result = resolveEffectiveWrappers(field, undefined, autoAssoc({ input: ['matches'], checkbox: ['does-not-match'] }));

    expect(result).toEqual([{ type: 'matches' }]);
  });

  it('returns a fresh array each call (callers may rely on identity)', () => {
    const field: TestField = { type: 'input' };
    const auto = autoAssoc({ input: ['auto'] });

    const first = resolveEffectiveWrappers(field, undefined, auto);
    const second = resolveEffectiveWrappers(field, undefined, auto);

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});
