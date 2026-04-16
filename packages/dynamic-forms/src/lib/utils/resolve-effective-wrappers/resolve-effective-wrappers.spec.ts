import { describe, it, expect } from 'vitest';
import { resolveEffectiveWrappers } from './resolve-effective-wrappers';
import { WrapperConfig, WrapperTypeDefinition } from '../../models/wrapper-type';
import { FieldDef } from '../../definitions/base/field-def';

type TestField = Pick<FieldDef<unknown>, 'type' | 'wrappers'>;

function makeDef(wrapperName: string, types?: readonly string[]): WrapperTypeDefinition {
  return {
    wrapperName,
    loadComponent: () => Promise.resolve(class {}),
    types,
  };
}

describe('resolveEffectiveWrappers', () => {
  it('returns an empty chain for a bare field with no defaults and no auto-associations', () => {
    const field: TestField = { type: 'input' };
    const registry = new Map<string, WrapperTypeDefinition>();

    expect(resolveEffectiveWrappers(field, undefined, registry)).toEqual([]);
  });

  it('returns the field-level wrappers unchanged when no defaults and no auto', () => {
    const fieldWrappers: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'a' } as WrapperConfig];
    const field: TestField = { type: 'input', wrappers: fieldWrappers };
    const registry = new Map<string, WrapperTypeDefinition>();

    const result = resolveEffectiveWrappers(field, undefined, registry);

    expect(result).toEqual(fieldWrappers);
  });

  it('returns an empty chain when field.wrappers === null (explicit opt-out)', () => {
    const field: TestField = { type: 'input', wrappers: null };
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'should-not-apply' } as WrapperConfig];
    const registry = new Map<string, WrapperTypeDefinition>([['row', makeDef('row', ['input'])]]);

    const result = resolveEffectiveWrappers(field, defaults, registry);

    expect(result).toEqual([]);
  });

  it('applies defaultWrappers when field.wrappers is undefined', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];
    const field: TestField = { type: 'input' };
    const registry = new Map<string, WrapperTypeDefinition>();

    const result = resolveEffectiveWrappers(field, defaults, registry);

    expect(result).toEqual(defaults);
  });

  it('merges auto-associations (outermost), defaults, then field-level wrappers (innermost)', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];
    const fieldWrappers: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'field-specific' } as WrapperConfig];
    const field: TestField = { type: 'input', wrappers: fieldWrappers };
    const registry = new Map<string, WrapperTypeDefinition>([
      ['auto-input', makeDef('auto-input', ['input'])],
      ['auto-select', makeDef('auto-select', ['select'])],
    ]);

    const result = resolveEffectiveWrappers(field, defaults, registry);

    expect(result).toEqual([{ type: 'auto-input' }, { type: 'css', cssClasses: 'default' }, { type: 'css', cssClasses: 'field-specific' }]);
  });

  it('skips auto-associations whose types do not include the field type', () => {
    const field: TestField = { type: 'input' };
    const registry = new Map<string, WrapperTypeDefinition>([
      ['matches', makeDef('matches', ['input', 'select'])],
      ['does-not-match', makeDef('does-not-match', ['checkbox'])],
    ]);

    const result = resolveEffectiveWrappers(field, undefined, registry);

    expect(result).toEqual([{ type: 'matches' }]);
  });

  it('returns a fresh array each call (callers may rely on identity)', () => {
    const field: TestField = { type: 'input' };
    const registry = new Map<string, WrapperTypeDefinition>([['auto', makeDef('auto', ['input'])]]);

    const first = resolveEffectiveWrappers(field, undefined, registry);
    const second = resolveEffectiveWrappers(field, undefined, registry);

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});
