import { describe, expect, it } from 'vitest';
import { resolveFieldParking, resolveFieldWindowing } from './resolve-field-windowing';
import { FieldParkingConfig, FieldWindowingConfig } from './field-windowing.token';

describe('resolveFieldWindowing', () => {
  const park: FieldParkingConfig = { enabled: true, margin: '100%' };
  const disabledGlobal: FieldWindowingConfig = { enabled: false, eager: 12, placeholderHeight: '4rem', park };
  const enabledGlobal: FieldWindowingConfig = { enabled: true, eager: 8, placeholderHeight: '3rem', park };

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
      park,
    });
    expect(resolveFieldWindowing(disabledGlobal, { placeholderHeight: '2rem' })).toEqual({
      enabled: true,
      eager: disabledGlobal.eager,
      placeholderHeight: '2rem',
      park,
    });
    expect(resolveFieldWindowing(disabledGlobal, {})).toEqual({
      enabled: true,
      eager: disabledGlobal.eager,
      placeholderHeight: disabledGlobal.placeholderHeight,
      park,
    });
  });

  it('clamps and floors a per-form eager override', () => {
    expect(resolveFieldWindowing(disabledGlobal, { eager: -5 }).eager).toBe(0);
    expect(resolveFieldWindowing(disabledGlobal, { eager: 4.9 }).eager).toBe(4);
  });

  it('carries a per-form parking override through', () => {
    expect(resolveFieldWindowing(disabledGlobal, { park: false }).park).toEqual({ enabled: false, margin: '100%' });
    expect(resolveFieldWindowing(disabledGlobal, { park: { margin: '50%' } }).park).toEqual({ enabled: true, margin: '50%' });
  });

  it('a park-only override leaves progressive mounting alone', () => {
    // Parking and deferred mounting are independent axes. Tuning one must not
    // silently switch the form's mounting strategy.
    expect(resolveFieldWindowing(disabledGlobal, { park: false }).enabled).toBe(false);
    expect(resolveFieldWindowing(disabledGlobal, { park: true }).enabled).toBe(false);
    expect(resolveFieldWindowing(enabledGlobal, { park: false }).enabled).toBe(true);
  });

  it('still force-enables when the override touches mounting', () => {
    expect(resolveFieldWindowing(disabledGlobal, { eager: 3, park: false }).enabled).toBe(true);
    expect(resolveFieldWindowing(disabledGlobal, { placeholderHeight: '2rem' }).enabled).toBe(true);
  });
});

describe('resolveFieldParking', () => {
  const global: FieldParkingConfig = { enabled: true, margin: '100%' };

  it('keeps parking on when a form says nothing about it', () => {
    expect(resolveFieldParking(global, undefined)).toEqual(global);
  });

  it('lets a form opt out entirely', () => {
    expect(resolveFieldParking(global, false)).toEqual({ enabled: false, margin: '100%' });
  });

  it('re-enables against a globally disabled default', () => {
    expect(resolveFieldParking({ enabled: false, margin: '100%' }, true)).toEqual(global);
  });

  it('an object override enables parking and tunes the margin', () => {
    expect(resolveFieldParking({ enabled: false, margin: '100%' }, { margin: '25%' })).toEqual({ enabled: true, margin: '25%' });
  });

  it('falls back to the global margin when the object omits it', () => {
    expect(resolveFieldParking(global, {})).toEqual(global);
  });
});
