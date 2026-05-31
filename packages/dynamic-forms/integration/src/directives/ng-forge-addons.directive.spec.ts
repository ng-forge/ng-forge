import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BehaviorSubject } from 'rxjs';
import type { AnyAddon, TextAddon, TemplateAddon } from '@ng-forge/dynamic-forms/internal';
import { NgForgeAddons, NgForgeAddonsBase, injectNgForgeAddons } from './ng-forge-addons.directive';

@Component({
  selector: 'test-addons-host',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgForgeAddons],
})
class TestAddonsHostComponent {
  protected readonly addons = injectNgForgeAddons();
}

function setupHost(addons?: ReadonlyArray<AnyAddon>): {
  fixture: ReturnType<typeof TestBed.createComponent<TestAddonsHostComponent>>;
  directive: NgForgeAddonsBase;
} {
  TestBed.configureTestingModule({ imports: [TestAddonsHostComponent] });
  const fixture = TestBed.createComponent(TestAddonsHostComponent);
  if (addons !== undefined) {
    fixture.componentRef.setInput('addons', addons);
  }
  fixture.detectChanges();
  // hostDirectives instances live on the component's injector, not the root one.
  const directive = fixture.componentRef.injector.get(NgForgeAddonsBase);
  return { fixture, directive };
}

const PREFIX_TEXT: TextAddon = { kind: 'text', slot: 'prefix', text: 'A' };
const SUFFIX_TEXT: TextAddon = { kind: 'text', slot: 'suffix', text: 'B' };
const PREFIX_TEMPLATE: TemplateAddon = { kind: 'template', slot: 'prefix', templateKey: 'x' };

describe('NgForgeAddons', () => {
  describe('defaults', () => {
    it('treats missing addons input as an empty list', () => {
      const { directive } = setupHost();
      expect(directive.addons()).toBeUndefined();
      expect(directive.visibleAddons()).toEqual([]);
      expect(directive.hasAddons()).toBe(false);
      expect(directive.prefixAddons()).toEqual([]);
      expect(directive.suffixAddons()).toEqual([]);
    });
  });

  describe('slot bucketing', () => {
    it('buckets visible addons into prefix / suffix views', () => {
      const { directive } = setupHost([PREFIX_TEXT, SUFFIX_TEXT, PREFIX_TEMPLATE]);
      expect(directive.hasAddons()).toBe(true);
      expect(directive.prefixAddons()).toEqual([PREFIX_TEXT, PREFIX_TEMPLATE]);
      expect(directive.suffixAddons()).toEqual([SUFFIX_TEXT]);
    });

    it('exposes a generic slot-keyed map view via `addonsBySlot`', () => {
      const customSlotAddon = { kind: 'text', slot: 'start', text: 'S' } as unknown as AnyAddon;
      const { directive } = setupHost([PREFIX_TEXT, customSlotAddon]);
      const bySlot = directive.addonsBySlot();
      expect(bySlot.get('prefix')).toEqual([PREFIX_TEXT]);
      expect(bySlot.get('start')).toEqual([customSlotAddon]);
      expect(bySlot.has('suffix')).toBe(false);
    });
  });

  describe('hiddenSignalCache', () => {
    it('returns the same Signal instance across re-evaluations for the same addon', () => {
      const { directive, fixture } = setupHost([PREFIX_TEXT]);
      const first = directive.hiddenSignalCache().get(PREFIX_TEXT);
      // Trigger a re-evaluation by reading hasAddons again.
      fixture.detectChanges();
      const second = directive.hiddenSignalCache().get(PREFIX_TEXT);
      expect(first).toBeDefined();
      expect(second).toBe(first);
    });

    it('resolves a static `hidden: true` to a signal yielding true', () => {
      const hidden: AnyAddon = { ...PREFIX_TEXT, hidden: true };
      const { directive } = setupHost([hidden]);
      expect(directive.hiddenSignalCache().get(hidden)?.()).toBe(true);
      expect(directive.visibleAddons()).toEqual([]);
      expect(directive.hasAddons()).toBe(false);
    });

    it('reacts to a Signal-typed `hidden` flipping', () => {
      const hidden = signal(false);
      const addon: AnyAddon = { ...PREFIX_TEXT, hidden };
      const { directive } = setupHost([addon]);
      expect(directive.visibleAddons()).toEqual([addon]);

      hidden.set(true);
      expect(directive.visibleAddons()).toEqual([]);

      hidden.set(false);
      expect(directive.visibleAddons()).toEqual([addon]);
    });

    it('resolves an Observable-typed `hidden` via toSignal under the host injector', () => {
      const subject = new BehaviorSubject<boolean>(false);
      const addon: AnyAddon = { ...PREFIX_TEXT, hidden: subject };
      const { directive } = setupHost([addon]);
      expect(directive.visibleAddons()).toEqual([addon]);

      subject.next(true);
      expect(directive.visibleAddons()).toEqual([]);
    });
  });

  describe('inject helper', () => {
    it('resolves the same directive instance under the component injector', () => {
      const { fixture, directive } = setupHost([PREFIX_TEXT]);
      const direct = fixture.componentRef.injector.get(NgForgeAddonsBase);
      expect(direct).toBe(directive);
      expect(direct.addons()).toEqual([PREFIX_TEXT]);
    });
  });

  describe('reactive addons array', () => {
    it('rebuilds the cache when the addons array changes by identity', () => {
      const { fixture, directive } = setupHost([PREFIX_TEXT]);
      const firstCache = directive.hiddenSignalCache();
      expect(firstCache.has(PREFIX_TEXT)).toBe(true);

      fixture.componentRef.setInput('addons', [SUFFIX_TEXT]);
      fixture.detectChanges();
      const secondCache = directive.hiddenSignalCache();
      expect(secondCache.has(PREFIX_TEXT)).toBe(false);
      expect(secondCache.has(SUFFIX_TEXT)).toBe(true);
    });

    it('reuses the same resolved hidden signal when a new addon object reuses the same Observable identity', () => {
      // Scenario: a `FormConfig` re-emit produces a structurally-different
      // addon object that carries the SAME `hidden` Observable instance. Tier
      // 1 (addon-reference identity) misses; tier 2 (`_hiddenByValue` WeakMap
      // keyed on the Observable identity) must hit so we don't spawn a fresh
      // `toSignal` subscription per re-emit.
      const subject = new BehaviorSubject<boolean>(false);
      const addonA: AnyAddon = { kind: 'text', slot: 'prefix', text: 'A', hidden: subject };
      const { fixture, directive } = setupHost([addonA]);
      const resolvedForA = directive.hiddenSignalCache().get(addonA);
      expect(resolvedForA).toBeDefined();

      // New addon object, same Observable instance.
      const addonB: AnyAddon = { kind: 'text', slot: 'prefix', text: 'A', hidden: subject };
      fixture.componentRef.setInput('addons', [addonB]);
      fixture.detectChanges();

      const resolvedForB = directive.hiddenSignalCache().get(addonB);
      expect(resolvedForB).toBe(resolvedForA);
    });
  });
});
