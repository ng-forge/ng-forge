import { TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { type AddonActionContext, DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { ADDON_ACTION_REGISTRY, type AddonActionHandler } from '@ng-forge/dynamic-forms/integration';
import { ADDON_PRESET_HANDLER, type AddonPresetHandler, NgForgeAddonActionBase } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it, vi } from 'vitest';
import type { MatButtonAddon } from '../types/addons';
import { MatButtonAddonComponent } from './mat-button-addon.component';

function silentLogger() {
  return { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };
}

function setup(addon: MatButtonAddon, opts: { registry?: Map<string, AddonActionHandler>; preset?: AddonPresetHandler } = {}) {
  const logger = silentLogger();
  const registry = opts.registry ?? new Map<string, AddonActionHandler>();
  const providers: unknown[] = [
    provideAnimations(),
    { provide: ADDON_ACTION_REGISTRY, useValue: registry },
    { provide: DynamicFormLogger, useValue: logger },
  ];
  if (opts.preset) providers.push({ provide: ADDON_PRESET_HANDLER, useValue: opts.preset });

  TestBed.configureTestingModule({
    imports: [MatButtonAddonComponent],
    providers,
  });
  const fixture = TestBed.createComponent(MatButtonAddonComponent);
  fixture.componentRef.setInput('addon', addon);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement, logger, registry };
}

describe('MatButtonAddonComponent', () => {
  describe('content axis', () => {
    it('icon-only (no label) renders <button mat-icon-button> with <mat-icon>', () => {
      const { el } = setup({
        kind: 'mat-button',
        slot: 'suffix',
        icon: 'close',
        ariaLabel: 'Clear',
      });
      const button = el.querySelector('button');
      expect(button).not.toBeNull();
      // mat-icon-button compiles its selector attribute onto the host button.
      expect(button?.hasAttribute('mat-icon-button')).toBe(true);
      expect(button?.querySelector('mat-icon')?.textContent?.trim()).toBe('close');
    });

    it('labeled renders <button mat-button> with label text', () => {
      const { el } = setup({
        kind: 'mat-button',
        slot: 'suffix',
        label: 'Search',
      });
      const button = el.querySelector('button');
      expect(button).not.toBeNull();
      expect(button?.hasAttribute('mat-button')).toBe(true);
      expect(button?.textContent).toContain('Search');
    });

    it('labeled with an icon renders both <mat-icon> and label text on a mat-button', () => {
      const { el } = setup({
        kind: 'mat-button',
        slot: 'suffix',
        icon: 'search',
        label: 'Search',
      });
      const button = el.querySelector('button');
      expect(button?.hasAttribute('mat-button')).toBe(true);
      expect(button?.querySelector('mat-icon')?.textContent?.trim()).toBe('search');
      expect(button?.textContent).toContain('Search');
    });
  });

  describe('color binding', () => {
    it('forwards addon.color onto the underlying mat-button host', () => {
      const { el } = setup({
        kind: 'mat-button',
        slot: 'suffix',
        label: 'Go',
        color: 'primary',
      });
      const button = el.querySelector('button');
      // Material applies the color via host class `mat-{color}` on the button.
      expect(button?.className).toContain('mat-primary');
    });
  });

  describe('disabled binding', () => {
    it('button is disabled when addon.disabled resolves true', () => {
      const { el } = setup({
        kind: 'mat-button',
        slot: 'suffix',
        icon: 'close',
        ariaLabel: 'Clear',
        disabled: true,
      });
      const button = el.querySelector('button');
      expect(button?.hasAttribute('disabled')).toBe(true);
    });

    it('button is enabled when addon.disabled is falsy', () => {
      const { el } = setup({
        kind: 'mat-button',
        slot: 'suffix',
        icon: 'close',
        ariaLabel: 'Clear',
      });
      const button = el.querySelector('button');
      expect(button?.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('click dispatch', () => {
    it('invokes the inline action handler with the action context', () => {
      const action = vi.fn();
      const addon: MatButtonAddon = {
        kind: 'mat-button',
        slot: 'suffix',
        icon: 'add',
        ariaLabel: 'Add',
        action,
      };
      const { el } = setup(addon);
      (el.querySelector('button') as HTMLButtonElement).click();
      expect(action).toHaveBeenCalledTimes(1);
      const ctx = action.mock.calls[0][0] as AddonActionContext;
      expect(ctx).toBeDefined();
      expect(ctx.field).toEqual({ key: '', type: '' });
    });

    it('looks up actionRef in the registry and dispatches that handler', () => {
      const handler = vi.fn();
      const registry = new Map<string, AddonActionHandler>([['runIt', handler]]);
      const { el } = setup({ kind: 'mat-button', slot: 'suffix', icon: 'send', ariaLabel: 'Send', actionRef: 'runIt' }, { registry });
      (el.querySelector('button') as HTMLButtonElement).click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('routes preset clicks through the registered ADDON_PRESET_HANDLER', () => {
      const run = vi.fn();
      const preset: AddonPresetHandler = { run };
      const { el } = setup({ kind: 'mat-button', slot: 'suffix', icon: 'close', ariaLabel: 'Clear', preset: 'clear' }, { preset });
      (el.querySelector('button') as HTMLButtonElement).click();
      expect(run).toHaveBeenCalledWith('clear', expect.any(Object));
    });

    it('decorative button (no preset/actionRef/action) absorbs the click as a no-op', () => {
      const { el, logger } = setup({
        kind: 'mat-button',
        slot: 'suffix',
        label: 'Info',
      });
      (el.querySelector('button') as HTMLButtonElement).click();
      // No handlers fired, no warning logged.
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('action signal access', () => {
    it('exposes the NgForgeAddonActionBase directive instance via DI', () => {
      const { fixture } = setup({
        kind: 'mat-button',
        slot: 'suffix',
        icon: 'close',
        ariaLabel: 'Clear',
      });
      const action = fixture.componentRef.injector.get(NgForgeAddonActionBase);
      expect(action).toBeDefined();
      expect(action.disabled()).toBe(false);
    });
  });
});
