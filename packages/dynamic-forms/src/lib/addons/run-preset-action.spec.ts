import { signal, type WritableSignal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AddonActionContext } from '../models/addon/addon-action';
import type { Logger } from '../providers/features/logger/logger.interface';
import { type PresetCollaborators, runPresetAction } from './run-preset-action';

// Core spec for the shared preset runner. Adapter preset-actions specs
// duplicate-test passthroughs into this runner; the focused coverage here
// lets the adapter specs collapse to "delegates to core" assertions.

interface LoggerStub extends Logger {
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
}

function makeLogger(): LoggerStub {
  return { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };
}

// Minimal ReadonlyFieldTree stub — orphan-guard discriminates on `form !== null`.
// The runner itself never invokes methods on `ctx.form`, so an opaque object
// is sufficient.
const FORM_STUB = {} as unknown as NonNullable<AddonActionContext['form']>;

function makeCtx(overrides: Partial<AddonActionContext> = {}): AddonActionContext {
  // Default ctx is field-bound: non-null `form` + callable `setValue`.
  return {
    field: { key: 'q', type: 'input' },
    form: FORM_STUB,
    value: 'hello',
    setValue: () => undefined,
    ...overrides,
  } as unknown as AddonActionContext;
}

function makeCollaborators(overrides: Partial<PresetCollaborators> = {}): {
  collab: PresetCollaborators;
  logger: LoggerStub;
} {
  const logger = makeLogger();
  return { collab: { logger, ...overrides }, logger };
}

const ADAPTER = 'TestAdapter';
const FIELD_LABEL = 'test-input';

describe('runPresetAction (core)', () => {
  describe('orphan guard', () => {
    it('skips mutate-style presets (clear/reset/toggle) when ctx.form === null (orphan)', async () => {
      const fieldValueSetter = vi.fn();
      const { collab, logger } = makeCollaborators({ fieldValueSetter });
      const orphanCtx = { field: { key: '', type: 'input' }, form: null, value: '' } as unknown as AddonActionContext;

      await runPresetAction('clear', orphanCtx, collab, ADAPTER, FIELD_LABEL);
      expect(fieldValueSetter).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0])).toContain("preset 'clear'");
    });

    it('allows clear when ctx.form is set even if field.key is empty (canonical discriminant)', async () => {
      // Per AddonActionContext, `form !== null` IS the field-bound variant —
      // empty `field.key` can occur legitimately in nested-array scenarios
      // and must NOT be treated as orphan.
      const fieldValueSetter = vi.fn();
      const { collab, logger } = makeCollaborators({ fieldValueSetter });
      const ctx = { field: { key: '', type: 'input' }, form: FORM_STUB, value: 'x' } as unknown as AddonActionContext;
      await runPresetAction('clear', ctx, collab, ADAPTER, FIELD_LABEL);
      expect(fieldValueSetter).toHaveBeenCalledWith('');
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('does NOT skip clipboard presets (copy/paste) — they only need the clipboard API, not a host field', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { readText: vi.fn(), writeText } });
      const { collab } = makeCollaborators();
      const orphanCtx = { field: { key: '', type: 'input' }, form: null, value: 'hello' } as unknown as AddonActionContext;
      await runPresetAction('copy', orphanCtx, collab, ADAPTER, FIELD_LABEL);
      expect(writeText).toHaveBeenCalledWith('hello');
    });
  });

  describe('clear', () => {
    it('writes empty string for string-typed field values', async () => {
      const fieldValueSetter = vi.fn();
      const { collab } = makeCollaborators({ fieldValueSetter });
      await runPresetAction('clear', makeCtx({ value: 'something' }), collab, ADAPTER, FIELD_LABEL);
      expect(fieldValueSetter).toHaveBeenCalledWith('');
    });

    it('writes undefined for non-string field values (preserves declared type)', async () => {
      const fieldValueSetter = vi.fn();
      const { collab } = makeCollaborators({ fieldValueSetter });
      await runPresetAction('clear', makeCtx({ value: 42 }), collab, ADAPTER, FIELD_LABEL);
      expect(fieldValueSetter).toHaveBeenCalledWith(undefined);
    });

    it('is a silent no-op when no fieldValueSetter is wired', async () => {
      const { collab, logger } = makeCollaborators();
      await runPresetAction('clear', makeCtx({ value: 'x' }), collab, ADAPTER, FIELD_LABEL);
      // Orphan guard doesn't fire (key is set); no writer collaborator
      // wired — silent no-op.
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('restores the configured default value via fieldDefaultValueGetter', async () => {
      const fieldValueSetter = vi.fn();
      const fieldDefaultValueGetter = vi.fn(() => 'default-val');
      const { collab } = makeCollaborators({ fieldValueSetter, fieldDefaultValueGetter });
      await runPresetAction('reset', makeCtx({ value: 'changed' }), collab, ADAPTER, FIELD_LABEL);
      expect(fieldDefaultValueGetter).toHaveBeenCalledTimes(1);
      expect(fieldValueSetter).toHaveBeenCalledWith('default-val');
    });

    it('falls back to empty string when no default is reachable', async () => {
      const fieldValueSetter = vi.fn();
      const { collab } = makeCollaborators({ fieldValueSetter });
      await runPresetAction('reset', makeCtx({ value: 'x' }), collab, ADAPTER, FIELD_LABEL);
      expect(fieldValueSetter).toHaveBeenCalledWith('');
    });

    it('falls back when the getter returns undefined (defaults map missing the key)', async () => {
      const fieldValueSetter = vi.fn();
      const fieldDefaultValueGetter = vi.fn(() => undefined);
      const { collab } = makeCollaborators({ fieldValueSetter, fieldDefaultValueGetter });
      await runPresetAction('reset', makeCtx({ value: 'x' }), collab, ADAPTER, FIELD_LABEL);
      expect(fieldValueSetter).toHaveBeenCalledWith('');
    });

    it('falls back to undefined for non-string value when no default exists (preserves type)', async () => {
      const fieldValueSetter = vi.fn();
      const { collab } = makeCollaborators({ fieldValueSetter });
      await runPresetAction('reset', makeCtx({ value: 42 }), collab, ADAPTER, FIELD_LABEL);
      expect(fieldValueSetter).toHaveBeenCalledWith(undefined);
    });
  });

  describe('paste', () => {
    let originalClipboard: PropertyDescriptor | undefined;
    beforeEach(() => {
      originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    });
    afterEach(() => {
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    });

    it('reads from navigator.clipboard and writes the result to the field', async () => {
      const readText = vi.fn().mockResolvedValue('pasted');
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { readText, writeText: vi.fn() } });
      const fieldValueSetter = vi.fn();
      const { collab } = makeCollaborators({ fieldValueSetter });
      await runPresetAction('paste', makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(readText).toHaveBeenCalledTimes(1);
      expect(fieldValueSetter).toHaveBeenCalledWith('pasted');
    });

    it('logs a warning when navigator.clipboard is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
      const fieldValueSetter = vi.fn();
      const { collab, logger } = makeCollaborators({ fieldValueSetter });
      await runPresetAction('paste', makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(fieldValueSetter).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0])).toContain('paste');
    });

    it('logs the error and message when clipboard read rejects', async () => {
      const readText = vi.fn().mockRejectedValue(new Error('denied'));
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { readText, writeText: vi.fn() } });
      const fieldValueSetter = vi.fn();
      const { collab, logger } = makeCollaborators({ fieldValueSetter });
      await runPresetAction('paste', makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(fieldValueSetter).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0])).toContain('denied');
    });
  });

  describe('copy', () => {
    let originalClipboard: PropertyDescriptor | undefined;
    beforeEach(() => {
      originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    });
    afterEach(() => {
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    });

    it('writes the current ctx.value to navigator.clipboard', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { readText: vi.fn(), writeText } });
      const { collab } = makeCollaborators();
      await runPresetAction('copy', makeCtx({ value: 'current-value' }), collab, ADAPTER, FIELD_LABEL);
      expect(writeText).toHaveBeenCalledWith('current-value');
    });

    it('coerces null/undefined value to empty string (never writes the literal "null"/"undefined")', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { readText: vi.fn(), writeText } });
      const { collab } = makeCollaborators();
      await runPresetAction('copy', makeCtx({ value: null }), collab, ADAPTER, FIELD_LABEL);
      expect(writeText).toHaveBeenCalledWith('');
      await runPresetAction('copy', makeCtx({ value: undefined }), collab, ADAPTER, FIELD_LABEL);
      expect(writeText).toHaveBeenLastCalledWith('');
    });

    it('logs a warning when navigator.clipboard is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
      const { collab, logger } = makeCollaborators();
      await runPresetAction('copy', makeCtx({ value: 'x' }), collab, ADAPTER, FIELD_LABEL);
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0])).toContain('copy');
    });

    it('logs the error message when clipboard write rejects', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('denied'));
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { readText: vi.fn(), writeText } });
      const { collab, logger } = makeCollaborators();
      await runPresetAction('copy', makeCtx({ value: 'x' }), collab, ADAPTER, FIELD_LABEL);
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0])).toContain('denied');
    });
  });

  describe('toggle-password-visibility', () => {
    it('flips typeOverride from password to text on first dispatch', async () => {
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>('password');
      const { collab } = makeCollaborators({ typeOverride });
      await runPresetAction('toggle-password-visibility', makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(typeOverride()).toBe('text');
    });

    it('flips text back to password on second dispatch', async () => {
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>('text');
      const { collab } = makeCollaborators({ typeOverride });
      await runPresetAction('toggle-password-visibility', makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(typeOverride()).toBe('password');
    });

    it('treats undefined initial override as "password" (configured type) and flips to text', async () => {
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
      const { collab } = makeCollaborators({ typeOverride });
      await runPresetAction('toggle-password-visibility', makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(typeOverride()).toBe('text');
    });

    it('warns when typeOverride collaborator is missing (preset has no host field type to flip)', async () => {
      const { collab, logger } = makeCollaborators();
      await runPresetAction('toggle-password-visibility', makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0])).toContain('toggle-password-visibility');
    });

    it('refuses to flip when baselineType reports a non-password type (e.g. email)', async () => {
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
      const { collab, logger } = makeCollaborators({ typeOverride, baselineType: () => 'email' });
      await runPresetAction('toggle-password-visibility', makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(typeOverride()).toBeUndefined();
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0])).toContain('email');
    });

    it('re-checks baselineType on every dispatch (refuses post-toggle when baseline mutates)', async () => {
      let baseline: string | undefined = 'password';
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
      const { collab, logger } = makeCollaborators({ typeOverride, baselineType: () => baseline });
      await runPresetAction('toggle-password-visibility', makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(typeOverride()).toBe('text');

      baseline = 'email';
      await runPresetAction('toggle-password-visibility', makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(typeOverride()).toBe('text'); // unchanged
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('unknown preset', () => {
    it('logs a warning naming the adapter and the unimplemented preset', async () => {
      const { collab, logger } = makeCollaborators();
      await runPresetAction('not-a-real-preset' as never, makeCtx(), collab, ADAPTER, FIELD_LABEL);
      expect(logger.warn).toHaveBeenCalled();
      const message = String(logger.warn.mock.calls[0]?.[0]);
      expect(message).toContain('not-a-real-preset');
      expect(message).toContain(ADAPTER);
    });
  });
});
