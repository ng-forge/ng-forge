import { describe, expect, it } from 'vitest';
import { resolveFieldWindowing } from './resolve-field-windowing';
import { FieldWindowingConfig } from './field-windowing.token';

describe('resolveFieldWindowing', () => {
  const disabledGlobal: FieldWindowingConfig = { enabled: false, eager: 12, placeholderHeight: '4rem' };
  const enabledGlobal: FieldWindowingConfig = { enabled: true, eager: 8, placeholderHeight: '3rem' };

  it('returns the global config unchanged when no per-form override is given', () => {
    expect(resolveFieldWindowing(disabledGlobal, undefined)).toEqual(disabledGlobal);
    expect(resolveFieldWindowing(enabledGlobal, undefined)).toEqual(enabledGlobal);
  });

  it('force-disables when per-form is false, even if the global feature is enabled', () => {
    expect(resolveFieldWindowing(enabledGlobal, false)).toEqual({ ...enabledGlobal, enabled: false });
  });

  it('force-enables with global numbers when per-form is true', () => {
    expect(resolveFieldWindowing(disabledGlobal, true)).toEqual({ ...disabledGlobal, enabled: true });
  });

  it('force-enables with per-form overrides, falling back to global numbers', () => {
    expect(resolveFieldWindowing(disabledGlobal, { eager: 3 })).toEqual({
      enabled: true,
      eager: 3,
      placeholderHeight: disabledGlobal.placeholderHeight,
    });
    expect(resolveFieldWindowing(disabledGlobal, { placeholderHeight: '2rem' })).toEqual({
      enabled: true,
      eager: disabledGlobal.eager,
      placeholderHeight: '2rem',
    });
    expect(resolveFieldWindowing(disabledGlobal, {})).toEqual({
      enabled: true,
      eager: disabledGlobal.eager,
      placeholderHeight: disabledGlobal.placeholderHeight,
    });
  });

  it('clamps and floors a per-form eager override', () => {
    expect(resolveFieldWindowing(disabledGlobal, { eager: -5 }).eager).toBe(0);
    expect(resolveFieldWindowing(disabledGlobal, { eager: 4.9 }).eager).toBe(4);
  });
});
