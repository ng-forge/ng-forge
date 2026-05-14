import { signal } from '@angular/core';
import type { AddonActionContext, AddonActionPreset, Logger } from '@ng-forge/dynamic-forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runIonicPresetAction } from './preset-actions';

interface Spies {
  setValue: ReturnType<typeof vi.fn>;
  readText: ReturnType<typeof vi.fn>;
  writeText: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
}

interface Harness {
  spies: Spies;
  logger: Logger;
  typeOverride: ReturnType<typeof signal<string | undefined>>;
  defaultValueGetter: () => unknown;
  defaultValue: unknown;
  context: AddonActionContext;
}

function makeHarness(overrides?: { value?: unknown; defaultValue?: unknown }): Harness {
  const spies: Spies = {
    setValue: vi.fn(),
    readText: vi.fn().mockResolvedValue('clipboard-text'),
    writeText: vi.fn().mockResolvedValue(undefined),
    warn: vi.fn(),
  };
  const logger: Logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: spies.warn,
    error: vi.fn(),
  };
  const typeOverride = signal<string | undefined>(undefined);
  const defaultValue = overrides?.defaultValue ?? 'default-value';
  return {
    spies,
    logger,
    typeOverride,
    defaultValue,
    defaultValueGetter: () => defaultValue,
    context: {
      field: { key: 'q', type: 'input' },
      form: null,
      value: overrides?.value ?? '',
      setValue: spies.setValue,
    },
  };
}

const originalClipboard = (globalThis as { navigator?: Navigator }).navigator?.clipboard;

beforeEach(() => {
  // Stub the clipboard API per-test; restore in afterEach.
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    configurable: true,
    value: {
      readText: vi.fn().mockResolvedValue(''),
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
  } else {
    delete (globalThis.navigator as { clipboard?: unknown }).clipboard;
  }
});

describe('runIonicPresetAction', () => {
  const cases: ReadonlyArray<{
    name: string;
    preset: AddonActionPreset;
    arrange?: (h: Harness) => void;
    assert: (h: Harness) => void | Promise<void>;
  }> = [
    {
      name: 'clear → writes empty string via fieldValueSetter',
      preset: 'clear',
      assert: (h) => {
        expect(h.spies.setValue).toHaveBeenCalledWith('');
      },
    },
    {
      name: 'reset → writes the field default value',
      preset: 'reset',
      assert: (h) => {
        expect(h.spies.setValue).toHaveBeenCalledWith('default-value');
      },
    },
    {
      name: 'reset → falls back to empty when no default is reachable',
      preset: 'reset',
      arrange: (h) => {
        // Replace the default getter with one that returns undefined.
        h.defaultValueGetter = () => undefined;
      },
      assert: (h) => {
        expect(h.spies.setValue).toHaveBeenCalledWith('');
      },
    },
    {
      name: 'paste → reads from clipboard and writes the result',
      preset: 'paste',
      arrange: () => {
        Object.defineProperty(globalThis.navigator, 'clipboard', {
          configurable: true,
          value: {
            readText: vi.fn().mockResolvedValue('pasted-content'),
            writeText: vi.fn().mockResolvedValue(undefined),
          },
        });
      },
      assert: (h) => {
        expect(h.spies.setValue).toHaveBeenCalledWith('pasted-content');
      },
    },
    {
      name: 'copy → writes the current value to the clipboard',
      preset: 'copy',
      arrange: (h) => {
        (h.context as { value: unknown }).value = 'current-value';
      },
      assert: () => {
        expect(globalThis.navigator.clipboard.writeText).toHaveBeenCalledWith('current-value');
      },
    },
    {
      name: 'toggle-password-visibility → flips undefined → text → password',
      preset: 'toggle-password-visibility',
      assert: (h) => {
        // First invocation: undefined → 'text'.
        expect(h.typeOverride()).toBe('text');
      },
    },
  ];

  for (const c of cases) {
    it(c.name, async () => {
      const h = makeHarness();
      c.arrange?.(h);
      await runIonicPresetAction(c.preset, h.context, {
        typeOverride: h.typeOverride,
        fieldValueSetter: h.spies.setValue,
        fieldDefaultValueGetter: h.defaultValueGetter,
        logger: h.logger,
      });
      await c.assert(h);
    });
  }

  it('warns when toggle-password-visibility is used outside an input field (no typeOverride)', async () => {
    const h = makeHarness();
    await runIonicPresetAction('toggle-password-visibility', h.context, {
      // typeOverride intentionally omitted
      fieldValueSetter: h.spies.setValue,
      fieldDefaultValueGetter: h.defaultValueGetter,
      logger: h.logger,
    });
    expect(h.spies.warn).toHaveBeenCalledOnce();
    expect(h.spies.warn.mock.calls[0][0]).toContain("preset 'toggle-password-visibility'");
  });

  it('toggle-password-visibility flips text → password on the second call', async () => {
    const h = makeHarness();
    h.typeOverride.set('text');
    await runIonicPresetAction('toggle-password-visibility', h.context, {
      typeOverride: h.typeOverride,
      fieldValueSetter: h.spies.setValue,
      fieldDefaultValueGetter: h.defaultValueGetter,
      logger: h.logger,
    });
    expect(h.typeOverride()).toBe('password');
  });

  it('warns when an unknown preset is dispatched', async () => {
    const h = makeHarness();
    await runIonicPresetAction('not-a-real-preset' as AddonActionPreset, h.context, {
      typeOverride: h.typeOverride,
      fieldValueSetter: h.spies.setValue,
      fieldDefaultValueGetter: h.defaultValueGetter,
      logger: h.logger,
    });
    expect(h.spies.warn).toHaveBeenCalledOnce();
    expect(h.spies.warn.mock.calls[0][0]).toContain("preset 'not-a-real-preset'");
  });
});
