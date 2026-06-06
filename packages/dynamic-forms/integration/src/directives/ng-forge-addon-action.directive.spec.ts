import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { ADDON_ACTION_REGISTRY, type WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';
import { ADDON_PRESET_HANDLER, type AddonPresetHandler } from './addon-preset-handler.token';
import { injectNgForgeAddonAction, NgForgeAddonAction, NgForgeAddonActionBase } from './ng-forge-addon-action.directive';

/**
 * Direct coverage for `NgForgeAddonActionBase.buildActionContext()` — the
 * setValue-resolution logic that adapters depend on. The 4 adapter button
 * specs cover the dispatch surface (preset/actionRef/action precedence);
 * this spec drills into the field-bound vs orphan branches and the
 * `tree.value` cast fallback.
 */

@Component({
  selector: 'test-action-host',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgForgeAddonAction],
})
class TestActionHostComponent {
  protected readonly action = injectNgForgeAddonAction();
}

function setup(addon: { type: string; slot: string }, fieldInputs?: WrapperFieldInputs) {
  const logger = { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };
  TestBed.configureTestingModule({
    imports: [TestActionHostComponent],
    providers: [
      { provide: DynamicFormLogger, useValue: logger },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
    ],
  });
  const fixture = TestBed.createComponent(TestActionHostComponent);
  fixture.componentRef.setInput('addon', addon);
  if (fieldInputs) fixture.componentRef.setInput('fieldInputs', fieldInputs);
  fixture.detectChanges();
  const directive = fixture.componentRef.injector.get(NgForgeAddonActionBase);
  return { fixture, directive, logger };
}

// Build a minimal "read-only" FieldTree projection — buildActionContext only
// accesses `tree.value` and `tree.value()` so we can stub a writable signal
// directly. The directive's writer fallback casts `value` to WritableSignal
// at runtime.
function makeReadonlyTreeStub<T>(initial: T) {
  const value = signal<T>(initial) as WritableSignal<T>;
  return {
    field: {
      value,
      valid: signal(false),
      invalid: signal(false),
      touched: signal(false),
      dirty: signal(false),
      required: signal(false),
      disabled: signal(false),
      hidden: signal(false),
      errors: signal<readonly unknown[]>([]),
    } as unknown as WrapperFieldInputs['field'],
    value,
  };
}

describe('NgForgeAddonActionBase — buildActionContext', () => {
  it('returns the orphan variant when no fieldInputs bag is supplied', () => {
    const { directive } = setup({ type: 'prime-button', slot: 'suffix' });
    const ctx = directive.buildActionContext();
    expect(ctx.form).toBeNull();
    expect(ctx.setValue).toBeUndefined();
    expect(ctx.value).toBeUndefined();
  });

  it('returns the orphan variant when the bag has no field tree', () => {
    const inputs: WrapperFieldInputs = { key: 'q', type: 'input' };
    const { directive } = setup({ type: 'prime-button', slot: 'suffix' }, inputs);
    const ctx = directive.buildActionContext();
    expect(ctx.form).toBeNull();
    expect(ctx.setValue).toBeUndefined();
  });

  it('returns field-bound with bag setValue when both are present (preferred path)', () => {
    const { field, value } = makeReadonlyTreeStub('hello');
    const bagSetValue = vi.fn();
    const inputs: WrapperFieldInputs = { key: 'q', type: 'input', field, setValue: bagSetValue };
    const { directive } = setup({ type: 'prime-button', slot: 'suffix' }, inputs);
    const ctx = directive.buildActionContext();
    expect(ctx.form).toBe(field);
    expect(ctx.field).toEqual({ key: 'q', type: 'input' });
    expect(ctx.value).toBe('hello');
    // Calling ctx.setValue routes to the bag-provided writer (not the cast fallback).
    ctx.setValue?.('next');
    expect(bagSetValue).toHaveBeenCalledWith('next');
    expect(value()).toBe('hello'); // bag writer did NOT touch the tree directly
  });

  it('falls back to tree.value cast when bag setValue is absent (production-build race recovery)', () => {
    const { field, value } = makeReadonlyTreeStub('initial');
    const inputs: WrapperFieldInputs = { key: 'q', type: 'input', field }; // no setValue
    const { directive } = setup({ type: 'prime-button', slot: 'suffix' }, inputs);
    const ctx = directive.buildActionContext();
    expect(ctx.form).toBe(field);
    expect(ctx.setValue).toBeDefined();
    ctx.setValue?.('via-cast');
    // The cast hit `value.set` directly.
    expect(value()).toBe('via-cast');
  });

  it('value reflects the current tree.value() at construction time', () => {
    const { field, value } = makeReadonlyTreeStub('one');
    const inputs: WrapperFieldInputs = { key: 'q', type: 'input', field, setValue: () => undefined };
    const { directive } = setup({ type: 'prime-button', slot: 'suffix' }, inputs);
    const ctx1 = directive.buildActionContext();
    expect(ctx1.value).toBe('one');
    value.set('two');
    const ctx2 = directive.buildActionContext();
    expect(ctx2.value).toBe('two');
  });

  it('writer fallback warns + no-ops when tree.value is not writable (Signal Forms drift guard)', () => {
    // Simulate a hypothetical future where FieldState.value is a derived signal.
    const readOnlyValue = (() => 'frozen') as unknown as WritableSignal<string>;
    Object.defineProperty(readOnlyValue, 'set', { value: undefined });
    const otherStub = signal(false);
    const field = {
      value: readOnlyValue,
      valid: otherStub,
      invalid: otherStub,
      touched: otherStub,
      dirty: otherStub,
      required: otherStub,
      disabled: otherStub,
      hidden: otherStub,
      errors: signal<readonly unknown[]>([]),
    } as unknown as WrapperFieldInputs['field'];
    const inputs: WrapperFieldInputs = { key: 'q', type: 'input', field };
    const { directive, logger } = setup({ type: 'prime-button', slot: 'suffix' }, inputs);
    const ctx = directive.buildActionContext();
    expect(() => ctx.setValue?.('attempt')).not.toThrow();
    // writeToFieldValue logs a warning through the directive's logger.
    expect(logger.warn).toHaveBeenCalled();
    expect(String(logger.warn.mock.calls[0]?.[0])).toContain('not a WritableSignal');
  });
});

describe('NgForgeAddonActionBase — dispatch precedence', () => {
  function setupWithPreset(preset: string, fieldInputs?: WrapperFieldInputs) {
    const presetHandler: AddonPresetHandler = { run: vi.fn() };
    const logger = { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };
    TestBed.configureTestingModule({
      imports: [TestActionHostComponent],
      providers: [
        { provide: DynamicFormLogger, useValue: logger },
        { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
        { provide: ADDON_PRESET_HANDLER, useValue: presetHandler },
      ],
    });
    const fixture = TestBed.createComponent(TestActionHostComponent);
    fixture.componentRef.setInput('addon', { type: 'prime-button', slot: 'suffix', preset });
    if (fieldInputs) fixture.componentRef.setInput('fieldInputs', fieldInputs);
    fixture.detectChanges();
    const directive = fixture.componentRef.injector.get(NgForgeAddonActionBase);
    return { directive, presetHandler, logger };
  }

  it('routes preset dispatches to the registered ADDON_PRESET_HANDLER with the built context', () => {
    const { field } = makeReadonlyTreeStub('q-value');
    const inputs: WrapperFieldInputs = { key: 'q', type: 'input', field, setValue: () => undefined };
    const { directive, presetHandler } = setupWithPreset('clear', inputs);
    directive.dispatch();
    expect(presetHandler.run).toHaveBeenCalledTimes(1);
    const [presetArg, ctxArg] = (presetHandler.run as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(presetArg).toBe('clear');
    expect(ctxArg.field).toEqual({ key: 'q', type: 'input' });
    expect(ctxArg.value).toBe('q-value');
  });

  it('warns when a preset is configured but no ADDON_PRESET_HANDLER is registered', () => {
    const logger = { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };
    TestBed.configureTestingModule({
      imports: [TestActionHostComponent],
      providers: [
        { provide: DynamicFormLogger, useValue: logger },
        { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
        // No ADDON_PRESET_HANDLER provided.
      ],
    });
    const fixture = TestBed.createComponent(TestActionHostComponent);
    fixture.componentRef.setInput('addon', { type: 'prime-button', slot: 'suffix', preset: 'clear' });
    fixture.detectChanges();
    const directive = fixture.componentRef.injector.get(NgForgeAddonActionBase);
    directive.dispatch();
    expect(logger.warn).toHaveBeenCalled();
    expect(String(logger.warn.mock.calls[0]?.[0])).toContain('ADDON_PRESET_HANDLER');
  });
});
