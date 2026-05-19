import { signal, WritableSignal } from '@angular/core';
import type { AddonActionContext } from '@ng-forge/dynamic-forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type PresetCollaborators, runMatPresetAction } from './preset-actions';

function makeCtx(value: unknown, setValue: (next: unknown) => void = () => undefined): AddonActionContext {
  // Default ctx is field-bound (has `setValue`) so the preset orphan-guard
  // does NOT fire. The `as unknown` cast bridges the discriminated union
  // (form: null implies setValue?: undefined) — these tests deliberately
  // exercise the writer in isolation from form-tree wiring.
  return {
    field: { key: 'q', type: 'input' },
    form: null,
    value,
    setValue,
  } as unknown as AddonActionContext;
}

function makeCollaborators(overrides: Partial<PresetCollaborators> = {}): {
  collab: PresetCollaborators;
  logger: { warn: ReturnType<typeof vi.fn> };
} {
  const logger = { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };
  return {
    collab: {
      logger,
      ...overrides,
    },
    logger,
  };
}

describe('runMatPresetAction', () => {
  describe('clear', () => {
    it('calls fieldValueSetter with empty string', async () => {
      const fieldValueSetter = vi.fn();
      const { collab } = makeCollaborators({ fieldValueSetter });
      await runMatPresetAction('clear', makeCtx('something'), collab);
      expect(fieldValueSetter).toHaveBeenCalledWith('');
    });

    it('is a no-op when no fieldValueSetter is wired', async () => {
      const { collab, logger } = makeCollaborators();
      await runMatPresetAction('clear', makeCtx('x'), collab);
      // No fieldValueSetter — function should silently no-op. No logger warning expected
      // (collaborator absence is not a misconfiguration; it just means the addon is
      // rendered outside an active field context).
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('restores the field default value via fieldDefaultValueGetter', async () => {
      const fieldValueSetter = vi.fn();
      const fieldDefaultValueGetter = vi.fn(() => 'default-val');
      const { collab } = makeCollaborators({ fieldValueSetter, fieldDefaultValueGetter });
      await runMatPresetAction('reset', makeCtx('changed'), collab);
      expect(fieldDefaultValueGetter).toHaveBeenCalledTimes(1);
      expect(fieldValueSetter).toHaveBeenCalledWith('default-val');
    });

    it('falls back to empty string when no default is reachable', async () => {
      const fieldValueSetter = vi.fn();
      const { collab } = makeCollaborators({ fieldValueSetter });
      await runMatPresetAction('reset', makeCtx('x'), collab);
      expect(fieldValueSetter).toHaveBeenCalledWith('');
    });

    it('falls back to empty string when the getter returns undefined', async () => {
      const fieldValueSetter = vi.fn();
      const fieldDefaultValueGetter = vi.fn(() => undefined);
      const { collab } = makeCollaborators({ fieldValueSetter, fieldDefaultValueGetter });
      await runMatPresetAction('reset', makeCtx('x'), collab);
      expect(fieldValueSetter).toHaveBeenCalledWith('');
    });
  });

  describe('paste', () => {
    let originalClipboard: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    });

    afterEach(() => {
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', originalClipboard);
      } else {
        // Remove the property if it didn't exist originally.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test cleanup
        delete (navigator as any).clipboard;
      }
    });

    it('reads from navigator.clipboard and writes the text into the field', async () => {
      const readText = vi.fn().mockResolvedValue('pasted-text');
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText, writeText: vi.fn() },
      });
      const fieldValueSetter = vi.fn();
      const { collab } = makeCollaborators({ fieldValueSetter });
      await runMatPresetAction('paste', makeCtx(''), collab);
      expect(readText).toHaveBeenCalledTimes(1);
      expect(fieldValueSetter).toHaveBeenCalledWith('pasted-text');
    });

    it('logs a warning when navigator.clipboard is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
      const fieldValueSetter = vi.fn();
      const { collab, logger } = makeCollaborators({ fieldValueSetter });
      await runMatPresetAction('paste', makeCtx(''), collab);
      expect(fieldValueSetter).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0] ?? '')).toContain('paste');
    });

    it('logs a warning when clipboard read fails', async () => {
      const readText = vi.fn().mockRejectedValue(new Error('denied'));
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText, writeText: vi.fn() },
      });
      const fieldValueSetter = vi.fn();
      const { collab, logger } = makeCollaborators({ fieldValueSetter });
      await runMatPresetAction('paste', makeCtx(''), collab);
      expect(fieldValueSetter).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0] ?? '')).toContain('denied');
    });
  });

  describe('copy', () => {
    let originalClipboard: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    });

    afterEach(() => {
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', originalClipboard);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test cleanup
        delete (navigator as any).clipboard;
      }
    });

    it('writes the current value into navigator.clipboard', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText: vi.fn(), writeText },
      });
      const { collab } = makeCollaborators();
      await runMatPresetAction('copy', makeCtx('current-value'), collab);
      expect(writeText).toHaveBeenCalledWith('current-value');
    });

    it('coerces null/undefined value to empty string', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText: vi.fn(), writeText },
      });
      const { collab } = makeCollaborators();
      await runMatPresetAction('copy', makeCtx(null), collab);
      expect(writeText).toHaveBeenCalledWith('');
    });

    it('logs a warning when navigator.clipboard is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
      const { collab, logger } = makeCollaborators();
      await runMatPresetAction('copy', makeCtx('x'), collab);
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0] ?? '')).toContain('copy');
    });

    it('logs a warning when clipboard write fails', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('denied'));
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText: vi.fn(), writeText },
      });
      const { collab, logger } = makeCollaborators();
      await runMatPresetAction('copy', makeCtx('x'), collab);
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0] ?? '')).toContain('denied');
    });
  });

  describe('toggle-password-visibility', () => {
    it('flips typeOverride from password to text on first call', async () => {
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>('password');
      const { collab } = makeCollaborators({ typeOverride });
      await runMatPresetAction('toggle-password-visibility', makeCtx(''), collab);
      expect(typeOverride()).toBe('text');
    });

    it('flips typeOverride from text back to password on second call', async () => {
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>('text');
      const { collab } = makeCollaborators({ typeOverride });
      await runMatPresetAction('toggle-password-visibility', makeCtx(''), collab);
      expect(typeOverride()).toBe('password');
    });

    it('treats undefined typeOverride as password (initial state) and flips to text', async () => {
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
      const { collab } = makeCollaborators({ typeOverride });
      await runMatPresetAction('toggle-password-visibility', makeCtx(''), collab);
      expect(typeOverride()).toBe('text');
    });

    it('logs a warning when no typeOverride collaborator is available', async () => {
      const { collab, logger } = makeCollaborators();
      await runMatPresetAction('toggle-password-visibility', makeCtx(''), collab);
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0] ?? '')).toContain('toggle-password-visibility');
    });

    it('refuses to flip non-password baseline types and leaves typeOverride untouched', async () => {
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
      const { collab, logger } = makeCollaborators({
        typeOverride,
        baselineType: () => 'email',
      });
      await runMatPresetAction('toggle-password-visibility', makeCtx(''), collab);
      expect(typeOverride()).toBeUndefined();
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0] ?? '')).toContain('email');
    });

    it('re-checks baselineType on every dispatch (refuses flip after a prior toggle)', async () => {
      // Baseline starts as 'password' → first toggle succeeds → baseline
      // mutates to 'email' → second toggle must refuse without corrupting
      // the override.
      let baseline: string | undefined = 'password';
      const typeOverride: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
      const { collab, logger } = makeCollaborators({
        typeOverride,
        baselineType: () => baseline,
      });
      await runMatPresetAction('toggle-password-visibility', makeCtx(''), collab);
      expect(typeOverride()).toBe('text');

      baseline = 'email';
      await runMatPresetAction('toggle-password-visibility', makeCtx(''), collab);
      expect(typeOverride()).toBe('text'); // unchanged
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('unknown preset', () => {
    it('logs a warning naming the unimplemented preset', async () => {
      const { collab, logger } = makeCollaborators();
      // Force the union to accept the unknown value — the runner is the
      // defence-in-depth seam that catches JSON-source configs the type
      // checker can't see.
      await runMatPresetAction('not-a-real-preset' as never, makeCtx(''), collab);
      expect(logger.warn).toHaveBeenCalled();
      expect(String(logger.warn.mock.calls[0]?.[0] ?? '')).toContain('not-a-real-preset');
    });
  });
});
