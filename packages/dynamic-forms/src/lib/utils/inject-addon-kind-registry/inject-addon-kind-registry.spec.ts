import { Component, Injector, runInInjectionContext, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { ADDON_KIND_REGISTRY, AddonKindDefinition } from '../../models/addon/addon-kind';
import { ADDON_KIND_COMPONENT_CACHE, injectAddonKindRegistry } from './inject-addon-kind-registry';

@Component({ standalone: true, template: '' })
class IconKindComponent {}

@Component({ standalone: true, template: '' })
class ButtonKindComponent {}

function makeRegistryEntry<T extends AddonKindDefinition>(entry: T): T {
  return entry;
}

function setupTestBed(kinds: AddonKindDefinition[]): Injector {
  const map = new Map<string, AddonKindDefinition>(kinds.map((k) => [k.kind, k]));
  TestBed.configureTestingModule({
    providers: [{ provide: ADDON_KIND_REGISTRY, useValue: map }],
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

    it('cache is scoped to the root injector (separate TestBeds get separate caches)', async () => {
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
  });
});
