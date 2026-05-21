import { signal, type WritableSignal } from '@angular/core';
import type { AddonActionContext, AddonActionPreset, Logger } from '@ng-forge/dynamic-forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runPrimePresetAction } from './preset-actions';

interface LoggerStub extends Logger {
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
}

function makeLogger(): LoggerStub {
  return { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };
}

const FORM_STUB = {} as unknown as NonNullable<AddonActionContext['form']>;

function makeCtx<T = unknown>(value: T = '' as T): AddonActionContext<T> {
  // Default ctx is field-bound: non-null `form` + callable `setValue`.
  return {
    field: { key: 'host', type: 'input' },
    form: FORM_STUB,
    value,
    setValue: () => undefined,
  } as unknown as AddonActionContext<T>;
}

/**
 * Override `navigator.clipboard` for the duration of a test. Returns the
 * restore function. Some browsers ship a non-configurable `clipboard`
 * accessor; `Object.defineProperty` with `configurable: true` ensures we
 * can put it back.
 */
function withClipboard(stub: Clipboard | undefined): () => void {
  const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    get: () => stub,
  });
  return () => {
    if (original) {
      Object.defineProperty(Navigator.prototype, 'clipboard', original);
    }
    // Clean up our own override on the instance.
    delete (navigator as unknown as { clipboard?: Clipboard }).clipboard;
  };
}

describe('runPrimePresetAction', () => {
  let logger: LoggerStub;
  let restoreClipboard: (() => void) | undefined;

  beforeEach(() => {
    logger = makeLogger();
    restoreClipboard = undefined;
  });

  afterEach(() => {
    restoreClipboard?.();
  });

  describe("preset 'clear'", () => {
    it('calls fieldValueSetter with empty string', async () => {
      const fieldValueSetter = vi.fn();
      await runPrimePresetAction('clear', makeCtx(), { fieldValueSetter, logger });
      expect(fieldValueSetter).toHaveBeenCalledWith('');
    });

    it('is a no-op when no setter is provided', async () => {
      // Should not throw.
      await runPrimePresetAction('clear', makeCtx(), { logger });
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe("preset 'reset'", () => {
    it('restores the field default when reachable', async () => {
      const fieldValueSetter = vi.fn();
      await runPrimePresetAction('reset', makeCtx(), {
        fieldValueSetter,
        fieldDefaultValueGetter: () => 'foo',
        logger,
      });
      expect(fieldValueSetter).toHaveBeenCalledWith('foo');
    });

    it('falls back to empty string when no default is reachable (no getter)', async () => {
      const fieldValueSetter = vi.fn();
      await runPrimePresetAction('reset', makeCtx(), { fieldValueSetter, logger });
      expect(fieldValueSetter).toHaveBeenCalledWith('');
    });

    it('falls back to empty string when getter returns undefined', async () => {
      const fieldValueSetter = vi.fn();
      await runPrimePresetAction('reset', makeCtx(), {
        fieldValueSetter,
        fieldDefaultValueGetter: () => undefined,
        logger,
      });
      expect(fieldValueSetter).toHaveBeenCalledWith('');
    });
  });

  describe("preset 'paste'", () => {
    it('reads from clipboard and writes via fieldValueSetter', async () => {
      const fieldValueSetter = vi.fn();
      restoreClipboard = withClipboard({
        readText: vi.fn().mockResolvedValue('pasted'),
        writeText: vi.fn(),
      } as unknown as Clipboard);

      await runPrimePresetAction('paste', makeCtx(), { fieldValueSetter, logger });

      expect(fieldValueSetter).toHaveBeenCalledWith('pasted');
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('warns and skips when clipboard API is unavailable', async () => {
      const fieldValueSetter = vi.fn();
      restoreClipboard = withClipboard(undefined);

      await runPrimePresetAction('paste', makeCtx(), { fieldValueSetter, logger });

      expect(fieldValueSetter).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0][0])).toContain('paste');
    });

    it('warns when clipboard read rejects', async () => {
      const fieldValueSetter = vi.fn();
      restoreClipboard = withClipboard({
        readText: vi.fn().mockRejectedValue(new Error('denied')),
        writeText: vi.fn(),
      } as unknown as Clipboard);

      await runPrimePresetAction('paste', makeCtx(), { fieldValueSetter, logger });

      expect(fieldValueSetter).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("preset 'copy'", () => {
    it('writes the host value to the clipboard', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      restoreClipboard = withClipboard({ writeText, readText: vi.fn() } as unknown as Clipboard);

      await runPrimePresetAction('copy', makeCtx('hello'), { logger });

      expect(writeText).toHaveBeenCalledWith('hello');
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('coerces null/undefined values to empty string', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      restoreClipboard = withClipboard({ writeText, readText: vi.fn() } as unknown as Clipboard);

      await runPrimePresetAction('copy', makeCtx(null), { logger });

      expect(writeText).toHaveBeenCalledWith('');
    });

    it('warns when clipboard API is unavailable', async () => {
      restoreClipboard = withClipboard(undefined);

      await runPrimePresetAction('copy', makeCtx('hello'), { logger });

      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0][0])).toContain('copy');
    });

    it('warns when clipboard write rejects', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('denied'));
      restoreClipboard = withClipboard({ writeText, readText: vi.fn() } as unknown as Clipboard);

      await runPrimePresetAction('copy', makeCtx('hello'), { logger });

      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("preset 'toggle-password-visibility'", () => {
    it('flips password → text when current type is password', async () => {
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>('password');
      await runPrimePresetAction('toggle-password-visibility', makeCtx(), { typeOverride, logger });
      expect(typeOverride()).toBe('text');
    });

    it('flips text → password when current type is text', async () => {
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>('text');
      await runPrimePresetAction('toggle-password-visibility', makeCtx(), { typeOverride, logger });
      expect(typeOverride()).toBe('password');
    });

    it('flips an undefined initial type to text (the non-text branch)', async () => {
      // Implementation: current === 'text' ? 'password' : 'text' — undefined falls into the else branch.
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
      await runPrimePresetAction('toggle-password-visibility', makeCtx(), { typeOverride, logger });
      expect(typeOverride()).toBe('text');
    });

    it('warns when no typeOverride collaborator is provided', async () => {
      await runPrimePresetAction('toggle-password-visibility', makeCtx(), { logger });
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0][0])).toContain('toggle-password-visibility');
    });
  });

  describe('unknown preset', () => {
    it('warns and does nothing', async () => {
      const fieldValueSetter = vi.fn();
      await runPrimePresetAction('not-a-preset' as AddonActionPreset, makeCtx(), { fieldValueSetter, logger });
      expect(fieldValueSetter).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0][0])).toContain('not-a-preset');
    });
  });
});
