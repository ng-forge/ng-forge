import { signal } from '@angular/core';
import type { AddonActionContext, Logger } from '@ng-forge/dynamic-forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runBsPresetAction, type PresetCollaborators } from './preset-actions';

function makeLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

const FORM_STUB = { disabled: signal(false) } as unknown as NonNullable<AddonActionContext['form']>;

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

describe('runBsPresetAction', () => {
  describe('clear', () => {
    it('calls fieldValueSetter with an empty string', async () => {
      const setter = vi.fn();
      await runBsPresetAction('clear', makeCtx(), {
        fieldValueSetter: setter,
        logger: makeLogger(),
      });
      expect(setter).toHaveBeenCalledTimes(1);
      expect(setter).toHaveBeenCalledWith('');
    });

    it('is a no-op when fieldValueSetter is absent', async () => {
      const logger = makeLogger();
      await runBsPresetAction('clear', makeCtx(), { logger });
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('writes the configured default value when getter returns one', async () => {
      const setter = vi.fn();
      await runBsPresetAction('reset', makeCtx(), {
        fieldValueSetter: setter,
        fieldDefaultValueGetter: () => 'default-text',
        logger: makeLogger(),
      });
      expect(setter).toHaveBeenCalledWith('default-text');
    });

    it('falls back to empty string when getter returns undefined', async () => {
      const setter = vi.fn();
      await runBsPresetAction('reset', makeCtx(), {
        fieldValueSetter: setter,
        fieldDefaultValueGetter: () => undefined,
        logger: makeLogger(),
      });
      expect(setter).toHaveBeenCalledWith('');
    });

    it('falls back to empty string when getter is absent', async () => {
      const setter = vi.fn();
      await runBsPresetAction('reset', makeCtx(), {
        fieldValueSetter: setter,
        logger: makeLogger(),
      });
      expect(setter).toHaveBeenCalledWith('');
    });

    it('preserves non-undefined defaults (including empty string and 0)', async () => {
      const setter = vi.fn();
      await runBsPresetAction('reset', makeCtx(), {
        fieldValueSetter: setter,
        fieldDefaultValueGetter: () => 0,
        logger: makeLogger(),
      });
      expect(setter).toHaveBeenCalledWith(0);
    });
  });

  describe('paste', () => {
    let originalClipboard: Clipboard | undefined;

    beforeEach(() => {
      originalClipboard = (navigator as Navigator & { clipboard?: Clipboard }).clipboard;
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: originalClipboard,
      });
    });

    it('reads from clipboard and writes the value', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText: vi.fn().mockResolvedValue('pasted text') },
      });
      const setter = vi.fn();
      await runBsPresetAction('paste', makeCtx(), {
        fieldValueSetter: setter,
        logger: makeLogger(),
      });
      expect(setter).toHaveBeenCalledWith('pasted text');
    });

    it('warns when clipboard.readText rejects', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText: vi.fn().mockRejectedValue(new Error('denied')) },
      });
      const setter = vi.fn();
      const logger = makeLogger();
      await runBsPresetAction('paste', makeCtx(), {
        fieldValueSetter: setter,
        logger,
      });
      expect(setter).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('paste'));
    });

    it('warns when clipboard API is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: undefined,
      });
      const logger = makeLogger();
      await runBsPresetAction('paste', makeCtx(), { logger });
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('paste'));
    });
  });

  describe('copy', () => {
    let originalClipboard: Clipboard | undefined;

    beforeEach(() => {
      originalClipboard = (navigator as Navigator & { clipboard?: Clipboard }).clipboard;
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: originalClipboard,
      });
    });

    it('writes the current field value to the clipboard', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });
      await runBsPresetAction('copy', makeCtx({ value: 'hello' }), {
        logger: makeLogger(),
      });
      expect(writeText).toHaveBeenCalledWith('hello');
    });

    it('coerces non-string values via String(...)', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });
      await runBsPresetAction('copy', makeCtx({ value: 42 }), { logger: makeLogger() });
      expect(writeText).toHaveBeenCalledWith('42');
    });

    it('writes empty string when value is null / undefined', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });
      await runBsPresetAction('copy', makeCtx({ value: null }), { logger: makeLogger() });
      expect(writeText).toHaveBeenCalledWith('');
    });

    it('warns when writeText rejects', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      });
      const logger = makeLogger();
      await runBsPresetAction('copy', makeCtx(), { logger });
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('copy'));
    });

    it('warns when clipboard API is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: undefined,
      });
      const logger = makeLogger();
      await runBsPresetAction('copy', makeCtx(), { logger });
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('copy'));
    });
  });

  describe('toggle-password-visibility', () => {
    it('flips an undefined override → text', async () => {
      const typeOverride = signal<string | undefined>(undefined);
      await runBsPresetAction('toggle-password-visibility', makeCtx(), {
        typeOverride,
        logger: makeLogger(),
      });
      expect(typeOverride()).toBe('text');
    });

    it('flips text → password', async () => {
      const typeOverride = signal<string | undefined>('text');
      await runBsPresetAction('toggle-password-visibility', makeCtx(), {
        typeOverride,
        logger: makeLogger(),
      });
      expect(typeOverride()).toBe('password');
    });

    it('flips password → text', async () => {
      const typeOverride = signal<string | undefined>('password');
      await runBsPresetAction('toggle-password-visibility', makeCtx(), {
        typeOverride,
        logger: makeLogger(),
      });
      expect(typeOverride()).toBe('text');
    });

    it('warns when no typeOverride is provided', async () => {
      const logger = makeLogger();
      await runBsPresetAction('toggle-password-visibility', makeCtx(), { logger });
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('toggle-password-visibility'));
    });
  });

  describe('unknown preset', () => {
    it('logs a warning for any unrecognised preset name', async () => {
      const logger = makeLogger();
      // Cast through unknown to bypass the union narrowing.
      await runBsPresetAction('no-such-preset' as unknown as Parameters<typeof runBsPresetAction>[0], makeCtx(), {
        logger,
      } satisfies PresetCollaborators);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('no-such-preset'));
    });
  });
});
