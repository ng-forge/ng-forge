import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { DynamicFormError } from '@ng-forge/dynamic-forms/internal';
import { ADDON_KIND_REGISTRY, AddonKindDefinition } from '@ng-forge/dynamic-forms/internal';
import { AnyAddon, TextAddon } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { ADDON_KIND_COMPONENT_CACHE } from '../utils/inject-addon-kind-registry/inject-addon-kind-registry';
import { DfAddonSlot } from './df-addon-slot.component';

@Component({ template: 'icon-rendered' })
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
      // Form-scoped cache: no providedIn-root default, so the test bed must
      // supply its own — same as `provideDynamicFormDI()` does in real use.
      { provide: ADDON_KIND_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
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
      // The explicit effect dispatches the loader; the `.catch` handler runs
      // outside any NgZone task, so `whenStable` returns immediately. Poll
      // until the warning lands — robust to any number of microtask hops.
      await vi.waitFor(() => expect(logger.warn).toHaveBeenCalled());

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
      await vi.waitFor(() => expect(logger.warn).toHaveBeenCalled());

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
      await vi.waitFor(() => expect(logger.warn).toHaveBeenCalled());

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
      await vi.waitFor(() => expect(logger.warn).toHaveBeenCalled());

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
      await vi.waitFor(() => expect(logger.warn).toHaveBeenCalled());
    });

    it('stale loader result for a swapped-out kind does not flip resolvedComponent', async () => {
      // Two kinds in the same registry, the first taking longer to load.
      // The slot starts on `slow`, swaps to `fast` before `slow` resolves.
      // The kind-tagged result must filter `slow`'s late component out so the
      // renderer keeps showing `fast`.
      @Component({ template: 'slow-rendered' })
      class SlowStub {}
      @Component({ template: 'fast-rendered' })
      class FastStub {}

      let releaseSlow: () => void = () => undefined;
      const slowPromise = new Promise<Type<unknown>>((resolve) => {
        releaseSlow = () => resolve(SlowStub);
      });

      const { fixture, el } = setup({
        kinds: [
          { kind: 'slow', loadComponent: () => slowPromise },
          { kind: 'fast', loadComponent: () => Promise.resolve(FastStub) },
        ],
        addon: { kind: 'slow', slot: 'prefix' } as unknown as AnyAddon,
      });

      // Swap to `fast` BEFORE `slow` resolves.
      fixture.componentRef.setInput('addon', { kind: 'fast', slot: 'prefix' } as unknown as AnyAddon);
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(el.textContent).toContain('fast-rendered');
      });

      // Now release the slow loader. The late {kind:'slow'} result should NOT
      // overwrite the displayed FastStub — `resolvedComponent` filters by
      // current addon kind.
      releaseSlow();
      await Promise.resolve();
      await Promise.resolve();
      fixture.detectChanges();
      expect(el.textContent).toContain('fast-rendered');
      expect(el.textContent).not.toContain('slow-rendered');
    });
  });

  describe('reactive hidden', () => {
    it('host display flips to none when hidden is true (cached, no NgComponentOutlet teardown)', async () => {
      const { fixture, el } = setup({
        kinds: [{ kind: 'text', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: { kind: 'text', slot: 'prefix', text: 'hi', hidden: true } as unknown as AnyAddon,
      });
      await fixture.whenStable();
      fixture.detectChanges();
      expect(el.style.display).toBe('none');
    });

    it('host has no display style when hidden is false', async () => {
      const { fixture, el } = setup({
        kinds: [{ kind: 'text', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: { kind: 'text', slot: 'prefix', text: 'hi', hidden: false } as unknown as AnyAddon,
      });
      await fixture.whenStable();
      fixture.detectChanges();
      expect(el.style.display).toBe('');
    });
  });

  describe('happy-path render', () => {
    it('renders the resolved kind component and forwards inputs', async () => {
      const { fixture, el } = setup({
        kinds: [{ kind: 'text', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: TEXT_ADDON,
      });
      // Wait until the loader resolves and the dispatcher renders the stub
      // (textContent flips from '' once `*ngComponentOutlet` mounts).
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(el.textContent).toContain('icon-rendered');
      });
    });

    it('synchronously renders on a cache hit (no microtask gap)', async () => {
      // Prime the loader once so the second slot uses the synchronous fast path
      // in `<df-addon-slot>` (the `cached` branch at the top of the effect).
      const { fixture: warmup, el: warmupEl } = setup({
        kinds: [{ kind: 'text', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: TEXT_ADDON,
      });
      await vi.waitFor(() => {
        warmup.detectChanges();
        expect(warmupEl.textContent).toContain('icon-rendered');
      });

      // Second instance under the same TestBed (and thus the same root
      // ADDON_KIND_COMPONENT_CACHE) hits the cache synchronously.
      const fixture2 = TestBed.createComponent(DfAddonSlot);
      fixture2.componentRef.setInput('addon', TEXT_ADDON);
      fixture2.detectChanges();

      expect((fixture2.nativeElement as HTMLElement).textContent).toContain('icon-rendered');
    });
  });

  describe('host attributes', () => {
    it('forwards `slot` attribute for shadow-DOM projection', async () => {
      const { fixture, el } = setup({
        kinds: [{ kind: 'text', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: { kind: 'text', slot: 'suffix', text: 'hi' } as unknown as AnyAddon,
      });
      await fixture.whenStable();
      fixture.detectChanges();
      expect(el.getAttribute('slot')).toBe('suffix');
    });

    it('forwards className when provided', async () => {
      const { fixture, el } = setup({
        kinds: [{ kind: 'text', loadComponent: () => Promise.resolve(IconAddonStub) }],
        addon: { kind: 'text', slot: 'prefix', text: 'hi', className: 'my-addon' } as unknown as AnyAddon,
      });
      await fixture.whenStable();
      fixture.detectChanges();
      expect(el.getAttribute('class')).toBe('my-addon');
    });
  });
});
