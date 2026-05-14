import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { DynamicFormError } from '../errors/dynamic-form-error';
import { ADDON_KIND_REGISTRY, AddonKindDefinition } from '../models/addon/addon-kind';
import { AnyAddon, TextAddon } from '../models/addon/addon-def';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { DfAddonSlot } from './df-addon-slot.component';

@Component({ standalone: true, template: 'icon-rendered' })
class IconAddonStub {}

interface LoggerCapture {
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
}

function setup(opts: { kinds?: AddonKindDefinition[]; addon: AnyAddon }): {
  fixture: ComponentFixture<DfAddonSlot>;
  logger: LoggerCapture;
  el: HTMLElement;
} {
  const logger: LoggerCapture = {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
  const map = new Map<string, AddonKindDefinition>((opts.kinds ?? []).map((k) => [k.kind, k]));

  TestBed.configureTestingModule({
    imports: [DfAddonSlot],
    providers: [
      { provide: ADDON_KIND_REGISTRY, useValue: map },
      { provide: DynamicFormLogger, useValue: logger },
    ],
  });

  const fixture = TestBed.createComponent(DfAddonSlot);
  fixture.componentRef.setInput('addon', opts.addon);
  fixture.detectChanges();
  return { fixture, logger, el: fixture.nativeElement as HTMLElement };
}

const TEXT_ADDON: TextAddon = { kind: 'text', slot: 'prefix', text: 'hi' };

describe('DfAddonSlot — dispatcher', () => {
  describe('registry miss', () => {
    it('logs an actionable warning when the addon kind is unregistered', async () => {
      const { logger, el } = setup({ kinds: [], addon: TEXT_ADDON });
      // The explicit effect runs synchronously for cache hit; for misses it dispatches the loader and falls
      // through to the catch branch. Allow microtasks to flush.
      await Promise.resolve();
      await Promise.resolve();

      expect(logger.warn).toHaveBeenCalled();
      const message = String(logger.warn.mock.calls[0]?.[0] ?? '');
      expect(message).toContain("Failed to load addon kind 'text'");
      expect(message).toContain('Registered kinds: (none)');
      // Renders nothing — no ng-component-outlet child.
      expect(el.children.length).toBe(0);
    });

    it('lists registered kinds in the warning when others exist', async () => {
      const { logger } = setup({
        kinds: [{ kind: 'icon', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: TEXT_ADDON,
      });
      await Promise.resolve();
      await Promise.resolve();

      expect(logger.warn).toHaveBeenCalled();
      const message = String(logger.warn.mock.calls[0]?.[0] ?? '');
      expect(message).toContain('Registered kinds: icon');
    });
  });

  describe('async load failure', () => {
    it('logs the underlying error and renders nothing', async () => {
      const { logger, el } = setup({
        kinds: [
          {
            kind: 'broken',
            loadComponent: () => Promise.reject(new Error('module not found')),
          },
        ],
        addon: { kind: 'broken', slot: 'prefix' } as unknown as AnyAddon,
      });
      // Wait for the loader promise + catch handler.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(logger.warn).toHaveBeenCalled();
      const message = String(logger.warn.mock.calls[0]?.[0] ?? '');
      expect(message).toContain("Failed to load addon kind 'broken'");
      expect(message).toMatch(/module not found/);
      // Renders nothing.
      expect(el.children.length).toBe(0);
    });

    it('loader returning null is reported as a load failure', async () => {
      const { logger } = setup({
        kinds: [
          {
            kind: 'empty',
            loadComponent: () => Promise.resolve(null as unknown as Type<unknown>),
          },
        ],
        addon: { kind: 'empty', slot: 'prefix' } as unknown as AnyAddon,
      });
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(logger.warn).toHaveBeenCalled();
      const message = String(logger.warn.mock.calls[0]?.[0] ?? '');
      expect(message).toMatch(/resolved to null|DynamicFormError/);
    });

    it('never throws — DynamicFormError instance is captured by the catch arm', async () => {
      // Defence-in-depth: even when the loader synchronously throws a typed
      // error, the dispatcher should absorb it.
      const { logger } = setup({
        kinds: [
          {
            kind: 'sync-throw',
            loadComponent: () => Promise.reject(new DynamicFormError('boom')),
          },
        ],
        addon: { kind: 'sync-throw', slot: 'prefix' } as unknown as AnyAddon,
      });
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('reactive hidden', () => {
    it('host display flips to none when hidden is true (cached, no NgComponentOutlet teardown)', async () => {
      const { fixture, el } = setup({
        kinds: [{ kind: 'text', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: { kind: 'text', slot: 'prefix', text: 'hi', hidden: true } as unknown as AnyAddon,
      });
      await Promise.resolve();
      fixture.detectChanges();
      expect(el.style.display).toBe('none');
    });

    it('host has no display style when hidden is false', async () => {
      const { fixture, el } = setup({
        kinds: [{ kind: 'text', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: { kind: 'text', slot: 'prefix', text: 'hi', hidden: false } as unknown as AnyAddon,
      });
      await Promise.resolve();
      fixture.detectChanges();
      expect(el.style.display).toBe('');
    });
  });

  describe('host attributes', () => {
    it('forwards `slot` attribute for shadow-DOM projection', async () => {
      const { fixture, el } = setup({
        kinds: [{ kind: 'text', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: { kind: 'text', slot: 'suffix', text: 'hi' } as unknown as AnyAddon,
      });
      await Promise.resolve();
      fixture.detectChanges();
      expect(el.getAttribute('slot')).toBe('suffix');
    });

    it('forwards className when provided', async () => {
      const { fixture, el } = setup({
        kinds: [{ kind: 'text', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: { kind: 'text', slot: 'prefix', text: 'hi', className: 'my-addon' } as unknown as AnyAddon,
      });
      await Promise.resolve();
      fixture.detectChanges();
      expect(el.getAttribute('class')).toBe('my-addon');
    });
  });
});
