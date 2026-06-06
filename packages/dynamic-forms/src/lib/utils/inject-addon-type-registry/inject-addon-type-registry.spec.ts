import { Component, Injector, runInInjectionContext, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DynamicFormError } from '@ng-forge/dynamic-forms/internal';
import { ADDON_TYPE_REGISTRY, AddonTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { ADDON_TYPE_COMPONENT_CACHE } from '@ng-forge/dynamic-forms/internal';
import { injectAddonTypeRegistry } from '@ng-forge/dynamic-forms/internal';

@Component({ template: '' })
class IconTypeComponent {}

@Component({ template: '' })
class ButtonTypeComponent {}

function makeRegistryEntry<T extends AddonTypeDefinition>(entry: T): T {
  return entry;
}

function setupTestBed(types: AddonTypeDefinition[]): Injector {
  const map = new Map<string, AddonTypeDefinition>(types.map((k) => [k.type, k]));
  TestBed.configureTestingModule({
    providers: [
      { provide: ADDON_TYPE_REGISTRY, useValue: map },
      // The cache token is form-scoped (no `providedIn: 'root'` default), so
      // the test bed must wire one explicitly — same as `provideDynamicFormDI`
      // does in real usage.
      { provide: ADDON_TYPE_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
    ],
  });
  return TestBed.inject(Injector);
}

describe('injectAddonTypeRegistry', () => {
  describe('getType / hasType / getTypeNames', () => {
    it('returns the registered definition by type discriminant', () => {
      const def = makeRegistryEntry({ type: 'icon', loadComponent: () => Promise.resolve(IconTypeComponent) });
      const injector = setupTestBed([def]);

      runInInjectionContext(injector, () => {
        const r = injectAddonTypeRegistry();
        expect(r.getType('icon')).toBe(def);
        expect(r.hasType('icon')).toBe(true);
        expect(r.getTypeNames()).toEqual(['icon']);
      });
    });

    it('returns undefined for unregistered types', () => {
      const injector = setupTestBed([]);
      runInInjectionContext(injector, () => {
        const r = injectAddonTypeRegistry();
        expect(r.getType('unknown')).toBeUndefined();
        expect(r.hasType('unknown')).toBe(false);
        expect(r.getTypeNames()).toEqual([]);
      });
    });
  });

  describe('loadTypeComponent — error paths', () => {
    it('throws DynamicFormError when the type is not registered (lists known types)', async () => {
      const def = makeRegistryEntry({ type: 'icon', loadComponent: () => Promise.resolve(IconTypeComponent) });
      const injector = setupTestBed([def]);
      const r = runInInjectionContext(injector, () => injectAddonTypeRegistry());

      await expect(r.loadTypeComponent('nope')).rejects.toThrow(DynamicFormError);
      await expect(r.loadTypeComponent('nope')).rejects.toThrow(/Currently registered types: icon/);
    });

    it('wraps loader rejections as DynamicFormError with type context', async () => {
      const def = makeRegistryEntry({
        type: 'broken',
        loadComponent: () => Promise.reject(new Error('network down')),
      });
      const injector = setupTestBed([def]);
      const r = runInInjectionContext(injector, () => injectAddonTypeRegistry());

      await expect(r.loadTypeComponent('broken')).rejects.toThrow(DynamicFormError);
      await expect(r.loadTypeComponent('broken')).rejects.toThrow(/Failed to load component for addon type 'broken'/);
      await expect(r.loadTypeComponent('broken')).rejects.toThrow(/network down/);
    });

    it('throws DynamicFormError when loader resolves to a falsy value', async () => {
      const def = makeRegistryEntry({
        type: 'empty',
        // Loader returns null — resolveDefaultExport yields null too.
        loadComponent: () => Promise.resolve(null as unknown as Type<unknown>),
      });
      const injector = setupTestBed([def]);
      const r = runInInjectionContext(injector, () => injectAddonTypeRegistry());

      await expect(r.loadTypeComponent('empty')).rejects.toThrow(DynamicFormError);
      await expect(r.loadTypeComponent('empty')).rejects.toThrow(/resolved to null/);
    });
  });

  describe('caching', () => {
    it('caches the resolved component on first load', async () => {
      let calls = 0;
      const def = makeRegistryEntry({
        type: 'icon',
        loadComponent: () => {
          calls++;
          return Promise.resolve(IconTypeComponent);
        },
      });
      const injector = setupTestBed([def]);
      const r = runInInjectionContext(injector, () => injectAddonTypeRegistry());

      const a = await r.loadTypeComponent('icon');
      const b = await r.loadTypeComponent('icon');

      expect(a).toBe(IconTypeComponent);
      expect(b).toBe(IconTypeComponent);
      expect(calls).toBe(1);
      expect(r.getLoadedTypeComponent('icon')).toBe(IconTypeComponent);
    });

    it('cache is scoped to the providing injector (separate TestBeds get separate caches)', async () => {
      // First TestBed — load, populate cache.
      const def1 = makeRegistryEntry({ type: 'icon', loadComponent: () => Promise.resolve(IconTypeComponent) });
      const injector1 = setupTestBed([def1]);
      const r1 = runInInjectionContext(injector1, () => injectAddonTypeRegistry());
      await r1.loadTypeComponent('icon');
      expect(r1.getLoadedTypeComponent('icon')).toBe(IconTypeComponent);
      const cache1 = TestBed.inject(ADDON_TYPE_COMPONENT_CACHE);

      // Reset TestBed → new root injector → new cache instance.
      TestBed.resetTestingModule();
      const def2 = makeRegistryEntry({ type: 'icon', loadComponent: () => Promise.resolve(ButtonTypeComponent) });
      const injector2 = setupTestBed([def2]);
      const r2 = runInInjectionContext(injector2, () => injectAddonTypeRegistry());
      const cache2 = TestBed.inject(ADDON_TYPE_COMPONENT_CACHE);

      expect(cache2).not.toBe(cache1);
      expect(r2.getLoadedTypeComponent('icon')).toBeUndefined();

      // Loading in the new scope honours the new definition.
      const cmp = await r2.loadTypeComponent('icon');
      expect(cmp).toBe(ButtonTypeComponent);
      // Original cache is unaffected.
      expect(cache1.get('icon')).toBe(IconTypeComponent);
    });

    it('two child injectors with conflicting loaders for the same type never cross-contaminate', async () => {
      // Single root injector; two child injectors each provide their own
      // registry + cache, mirroring two simultaneously-mounted <df-dynamic-form>
      // instances under one app. The form-scoped cache must guarantee one
      // form's loaded component is never returned to the other.
      const reg1 = new Map<string, AddonTypeDefinition>([
        ['icon', { type: 'icon', loadComponent: () => Promise.resolve(IconTypeComponent) }],
      ]);
      const reg2 = new Map<string, AddonTypeDefinition>([
        ['icon', { type: 'icon', loadComponent: () => Promise.resolve(ButtonTypeComponent) }],
      ]);

      TestBed.configureTestingModule({});
      const root = TestBed.inject(Injector);
      const child1 = Injector.create({
        parent: root,
        providers: [
          { provide: ADDON_TYPE_REGISTRY, useValue: reg1 },
          { provide: ADDON_TYPE_COMPONENT_CACHE, useValue: new Map<string, Type<unknown>>() },
        ],
      });
      const child2 = Injector.create({
        parent: root,
        providers: [
          { provide: ADDON_TYPE_REGISTRY, useValue: reg2 },
          { provide: ADDON_TYPE_COMPONENT_CACHE, useValue: new Map<string, Type<unknown>>() },
        ],
      });

      const r1 = runInInjectionContext(child1, () => injectAddonTypeRegistry());
      const r2 = runInInjectionContext(child2, () => injectAddonTypeRegistry());

      // Both forms request the same type name concurrently.
      const [c1, c2] = await Promise.all([r1.loadTypeComponent('icon'), r2.loadTypeComponent('icon')]);
      expect(c1).toBe(IconTypeComponent);
      expect(c2).toBe(ButtonTypeComponent);

      // Synchronous cache hit on the second access also stays isolated.
      expect(r1.getLoadedTypeComponent('icon')).toBe(IconTypeComponent);
      expect(r2.getLoadedTypeComponent('icon')).toBe(ButtonTypeComponent);
    });
  });
});
