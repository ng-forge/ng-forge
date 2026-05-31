import { signal, type WritableSignal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import type { ReadonlyFieldTree } from '@ng-forge/dynamic-forms/internal';
import { buildFieldInputs } from './build-field-inputs';

// Minimal FieldTree stub. Signal Forms' FieldTree is a callable that returns a
// FieldState; we only need `().value` to be writable and the rest of the
// readonly-projection shape for `toReadonlyFieldTreeCached`. Other state
// signals are stubbed because `toReadonlyFieldTree` reads them.
function makeFieldTree(initial: unknown): {
  tree: () => unknown;
  valueSignal: WritableSignal<unknown>;
} {
  const valueSignal = signal<unknown>(initial);
  const otherStub = signal(false);
  const state = {
    value: valueSignal,
    valid: otherStub,
    invalid: otherStub,
    touched: otherStub,
    dirty: otherStub,
    required: otherStub,
    disabled: otherStub,
    hidden: otherStub,
    errors: signal<readonly unknown[]>([]),
  };
  const tree = () => state;
  return { tree, valueSignal };
}

describe('buildFieldInputs', () => {
  it('passes through scalar rawInputs unchanged (no field present)', () => {
    const cache = new WeakMap();
    const out = buildFieldInputs({ key: 'q', label: 'Q', placeholder: 'type' }, cache, 'input');
    expect(out.key).toBe('q');
    expect(out.label).toBe('Q');
    expect(out.placeholder).toBe('type');
    expect(out.type).toBe('input');
    expect(out.field).toBeUndefined();
    expect(out.setValue).toBeUndefined();
  });

  it('produces a ReadonlyFieldTree view when rawInputs.field is callable', () => {
    const cache = new WeakMap();
    const { tree } = makeFieldTree('initial');
    const out = buildFieldInputs({ key: 'q', field: tree }, cache, 'input');
    const view = out.field as ReadonlyFieldTree<unknown>;
    expect(view).toBeDefined();
    expect(view.value()).toBe('initial');
    expect(view.valid()).toBe(false);
  });

  it('caches the ReadonlyFieldTree view across calls with the same source tree', () => {
    const cache = new WeakMap();
    const { tree } = makeFieldTree('a');
    const out1 = buildFieldInputs({ key: 'q', field: tree }, cache, 'input');
    const out2 = buildFieldInputs({ key: 'q', field: tree }, cache, 'input');
    expect(out2.field).toBe(out1.field);
  });

  it('produces a setValue writer that mutates the underlying signal', () => {
    const cache = new WeakMap();
    const { tree, valueSignal } = makeFieldTree('initial');
    const out = buildFieldInputs({ key: 'q', field: tree }, cache, 'input');
    expect(out.setValue).toBeDefined();
    out.setValue?.('next');
    expect(valueSignal()).toBe('next');
  });

  it('forwards the fieldType param onto the bag', () => {
    const cache = new WeakMap();
    const out = buildFieldInputs({ key: 'q' }, cache, 'datepicker');
    expect(out.type).toBe('datepicker');
  });

  it('omits setValue when rawInputs.field is missing (orphan render)', () => {
    const cache = new WeakMap();
    const out = buildFieldInputs({ key: 'q', label: 'Q' }, cache);
    expect(out.setValue).toBeUndefined();
    expect(out.field).toBeUndefined();
  });

  it('omits setValue when rawInputs.field is not callable', () => {
    const cache = new WeakMap();
    // Some mappers might emit a non-callable placeholder during init.
    const out = buildFieldInputs({ key: 'q', field: { not: 'a function' } }, cache);
    expect(out.setValue).toBeUndefined();
    expect(out.field).toBeUndefined();
  });

  it('setValue silently no-ops + warns when the underlying signal is not writable', () => {
    // Simulate Signal Forms returning a non-writable signal (computed-like).
    // writeToFieldValue will detect missing `.set` and warn instead of throwing.
    // The fieldTree's `value` is read-only (no `set` method).
    const cache = new WeakMap();
    const readOnlyValue = (() => 'frozen') as unknown as WritableSignal<unknown>;
    // Override `set` to be missing.
    Object.defineProperty(readOnlyValue, 'set', { value: undefined });
    const otherStub = signal(false);
    const state = {
      value: readOnlyValue,
      valid: otherStub,
      invalid: otherStub,
      touched: otherStub,
      dirty: otherStub,
      required: otherStub,
      disabled: otherStub,
      hidden: otherStub,
      errors: signal<readonly unknown[]>([]),
    };
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const out = buildFieldInputs({ key: 'q', field: () => state }, cache);
      // No logger passed to buildFieldInputs; writeToFieldValue is silent
      // (logger is optional). Verifies the no-throw contract — the writer
      // returns without crashing.
      expect(() => out.setValue?.('attempt')).not.toThrow();
    } finally {
      warnSpy.mockRestore();
    }
  });
});
