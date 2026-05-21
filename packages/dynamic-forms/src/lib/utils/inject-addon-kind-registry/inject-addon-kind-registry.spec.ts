import { Component, Injector, runInInjectionContext, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { ADDON_KIND_REGISTRY, AddonKindDefinition } from '../../models/addon/addon-kind';
import { ADDON_KIND_COMPONENT_CACHE, injectAddonKindRegistry } from './inject-addon-kind-registry';

@Component({ template: '' })
class IconKindComponent {}

@Component({ template: '' })
class ButtonKindComponent {}

function makeRegistryEntry<T extends AddonKindDefinition>(entry: T): T {
  return entry;
}

function setupTestBed(kinds: AddonKindDefinition[]): Injector {
  const map = new Map<string, AddonKindDefinition>(kinds.map((k) => [k.kind, k]));
  TestBed.configureTestingModule({
    providers: [
      { provide: ADDON_KIND_REGISTRY, useValue: map },
      // The cache token is form-scoped (no `providedIn: 'root'` default), so
      // the test bed must wire one explicitly — same as `provideDynamicFormDI`
      // does in real usage.
      { provide: ADDON_KIND_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
    ],
  });
  return TestBed.inject(Injector);
}

describe('injectAddonKindRegistry', () => {
  describe('getKind / hasKind / getKindNames', () => {
    it('returns the registered definition by kind discriminant', () => {
      const def = makeRegistryEntry({ kind: 'icon', loadComponent: () => Promise.resolve(IconKindComponent) });
      const injector = setupTestBed([def]);

      runInInjectionContext(injector, () => {
        const r = injectAddonKindRegistry();
        expect(r.getKind('icon')).toBe(def);
        expect(r.hasKind('icon')).toBe(true);
        expect(r.getKindNames()).toEqual(['icon']);
      });
    });

    it('returns undefined for unregistered kinds', () => {
      const injector = setupTestBed([]);
      runInInjectionContext(injector, () => {
        const r = injectAddonKindRegistry();
        expect(r.getKind('unknown')).toBeUndefined();
        expect(r.hasKind('unknown')).toBe(false);
        expect(r.getKindNames()).toEqual([]);
      });
    });
  });

  describe('loadKindComponent — error paths', () => {
    it('throws DynamicFormError when the kind is not registered (lists known kinds)', async () => {
      const def = makeRegistryEntry({ kind: 'icon', loadComponent: () => Promise.resolve(IconKindComponent) });
      const injector = setupTestBed([def]);
      const r = runInInjectionContext(injector, () => injectAddonKindRegistry());

      await expect(r.loadKindComponent('nope')).rejects.toThrow(DynamicFormError);
      await expect(r.loadKindComponent('nope')).rejects.toThrow(/Currently registered kinds: icon/);
    });

    it('wraps loader rejections as DynamicFormError with kind context', async () => {
      const def = makeRegistryEntry({
        kind: 'broken',
        loadComponent: () => Promise.reject(new Error('network down')),
      });
      const injector = setupTestBed([def]);
      const r = runInInjectionContext(injector, () => injectAddonKindRegistry());

      await expect(r.loadKindComponent('broken')).rejects.toThrow(DynamicFormError);
      await expect(r.loadKindComponent('broken')).rejects.toThrow(/Failed to load component for addon kind 'broken'/);
      await expect(r.loadKindComponent('broken')).rejects.toThrow(/network down/);
    });

    it('throws DynamicFormError when loader resolves to a falsy value', async () => {
      const def = makeRegistryEntry({
        kind: 'empty',
        // Loader returns null — resolveDefaultExport yields null too.
        loadComponent: () => Promise.resolve(null as unknown as Type<unknown>),
      });
      const injector = setupTestBed([def]);
      const r = runInInjectionContext(injector, () => injectAddonKindRegistry());

      await expect(r.loadKindComponent('empty')).rejects.toThrow(DynamicFormError);
      await expect(r.loadKindComponent('empty')).rejects.toThrow(/resolved to null/);
    });
  });

  describe('caching', () => {
    it('caches the resolved component on first load', async () => {
      let calls = 0;
      const def = makeRegistryEntry({
        kind: 'icon',
        loadComponent: () => {
          calls++;
          return Promise.resolve(IconKindComponent);
        },
      });
      const injector = setupTestBed([def]);
      const r = runInInjectionContext(injector, () => injectAddonKindRegistry());

      const a = await r.loadKindComponent('icon');
      const b = await r.loadKindComponent('icon');

      expect(a).toBe(IconKindComponent);
      expect(b).toBe(IconKindComponent);
      expect(calls).toBe(1);
      expect(r.getLoadedKindComponent('icon')).toBe(IconKindComponent);
    });

    it('cache is scoped to the providing injector (separate TestBeds get separate caches)', async () => {
      // First TestBed — load, populate cache.
      const def1 = makeRegistryEntry({ kind: 'icon', loadComponent: () => Promise.resolve(IconKindComponent) });
      const injector1 = setupTestBed([def1]);
      const r1 = runInInjectionContext(injector1, () => injectAddonKindRegistry());
      await r1.loadKindComponent('icon');
      expect(r1.getLoadedKindComponent('icon')).toBe(IconKindComponent);
      const cache1 = TestBed.inject(ADDON_KIND_COMPONENT_CACHE);

      // Reset TestBed → new root injector → new cache instance.
      TestBed.resetTestingModule();
      const def2 = makeRegistryEntry({ kind: 'icon', loadComponent: () => Promise.resolve(ButtonKindComponent) });
      const injector2 = setupTestBed([def2]);
      const r2 = runInInjectionContext(injector2, () => injectAddonKindRegistry());
      const cache2 = TestBed.inject(ADDON_KIND_COMPONENT_CACHE);

      expect(cache2).not.toBe(cache1);
      expect(r2.getLoadedKindComponent('icon')).toBeUndefined();

      // Loading in the new scope honours the new definition.
      const cmp = await r2.loadKindComponent('icon');
      expect(cmp).toBe(ButtonKindComponent);
      // Original cache is unaffected.
      expect(cache1.get('icon')).toBe(IconKindComponent);
    });

    it('two child injectors with conflicting loaders for the same kind never cross-contaminate', async () => {
      // Single root injector; two child injectors each provide their own
      // registry + cache, mirroring two simultaneously-mounted <df-dynamic-form>
      // instances under one app. The form-scoped cache must guarantee one
      // form's loaded component is never returned to the other.
      const reg1 = new Map<string, AddonKindDefinition>([
        ['icon', { kind: 'icon', loadComponent: () => Promise.resolve(IconKindComponent) }],
      ]);
      const reg2 = new Map<string, AddonKindDefinition>([
        ['icon', { kind: 'icon', loadComponent: () => Promise.resolve(ButtonKindComponent) }],
      ]);

      TestBed.configureTestingModule({});
      const root = TestBed.inject(Injector);
      const child1 = Injector.create({
        parent: root,
        providers: [
          { provide: ADDON_KIND_REGISTRY, useValue: reg1 },
          { provide: ADDON_KIND_COMPONENT_CACHE, useValue: new Map<string, Type<unknown>>() },
        ],
      });
      const child2 = Injector.create({
        parent: root,
        providers: [
          { provide: ADDON_KIND_REGISTRY, useValue: reg2 },
          { provide: ADDON_KIND_COMPONENT_CACHE, useValue: new Map<string, Type<unknown>>() },
        ],
      });

      const r1 = runInInjectionContext(child1, () => injectAddonKindRegistry());
      const r2 = runInInjectionContext(child2, () => injectAddonKindRegistry());

      // Both forms request the same kind name concurrently.
      const [c1, c2] = await Promise.all([r1.loadKindComponent('icon'), r2.loadKindComponent('icon')]);
      expect(c1).toBe(IconKindComponent);
      expect(c2).toBe(ButtonKindComponent);

      // Synchronous cache hit on the second access also stays isolated.
      expect(r1.getLoadedKindComponent('icon')).toBe(IconKindComponent);
      expect(r2.getLoadedKindComponent('icon')).toBe(ButtonKindComponent);
    });
  });
});
