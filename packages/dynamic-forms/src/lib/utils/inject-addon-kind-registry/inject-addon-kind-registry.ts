import { inject, InjectionToken, Type } from '@angular/core';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { ADDON_KIND_REGISTRY, AddonKindDefinition } from '../../models/addon/addon-kind';
import { resolveDefaultExport } from '../wrapper-chain/wrapper-chain';

/**
 * Cache for resolved addon-kind components.
 *
 * SSR-safe via `providedIn: 'root'` — each SSR request gets a fresh root
 * injector so the cache is request-scoped, not module-scoped.
 *
 * Mirrors `COMPONENT_CACHE` (field types) and `WRAPPER_COMPONENT_CACHE`
 * (wrappers).
 *
 * @internal
 */
export const ADDON_KIND_COMPONENT_CACHE = new InjectionToken<Map<string, Type<unknown>>>('ADDON_KIND_COMPONENT_CACHE', {
  providedIn: 'root',
  factory: () => new Map(),
});

/**
 * Public shape returned by {@link injectAddonKindRegistry}. Pinned explicitly
 * so the API extractor doesn't churn between versions when the inner factory
 * gets refactored.
 */
export interface AddonKindRegistryRef {
  getKind(kind: string): AddonKindDefinition | undefined;
  hasKind(kind: string): boolean;
  getKindNames(): string[];
  loadKindComponent(kind: string): Promise<Type<unknown>>;
  getLoadedKindComponent(kind: string): Type<unknown> | undefined;
  readonly raw: ReadonlyMap<string, AddonKindDefinition>;
}

/**
 * Injection function for accessing the addon kind registry.
 *
 * Usage parallels {@link injectFieldRegistry}: lookup, lazy load, cache.
 * Must be called within an injection context.
 *
 * @example
 * ```typescript
 * const addonKinds = injectAddonKindRegistry();
 * const Component = await addonKinds.loadKindComponent('prime-icon');
 * ```
 */
export function injectAddonKindRegistry(): AddonKindRegistryRef {
  const registry = inject(ADDON_KIND_REGISTRY);
  const componentCache = inject(ADDON_KIND_COMPONENT_CACHE);

  return {
    /** Look up a kind definition by its discriminant. */
    getKind(kind: string): AddonKindDefinition | undefined {
      return registry.get(kind);
    },

    /** Whether a kind is currently registered. */
    hasKind(kind: string): boolean {
      return registry.has(kind);
    },

    /** All registered kind names — useful for actionable validator warnings. */
    getKindNames(): string[] {
      return Array.from(registry.keys());
    },

    /**
     * Resolve a kind to its renderer component. Caches on first resolution.
     *
     * @throws DynamicFormError when the kind is not registered.
     */
    async loadKindComponent(kind: string): Promise<Type<unknown>> {
      const definition = registry.get(kind);
      if (!definition) {
        const known = Array.from(registry.keys()).join(', ') || '(none)';
        throw new DynamicFormError(`Addon kind '${kind}' is not registered. Currently registered kinds: ${known}.`);
      }

      const cached = componentCache.get(kind);
      if (cached) {
        return cached;
      }

      try {
        const component = resolveDefaultExport(await definition.loadComponent());
        if (component) {
          componentCache.set(kind, component);
          return component;
        }
        throw new DynamicFormError(`Addon kind '${kind}' loadComponent resolved to null.`);
      } catch (error) {
        if (error instanceof DynamicFormError) throw error;
        throw new DynamicFormError(`Failed to load component for addon kind '${kind}': ${String(error)}`);
      }
    },

    /**
     * Synchronous lookup of an already-loaded kind component, or undefined.
     * Returns `undefined` when the kind isn't registered in this scope even
     * if a prior scope cached a component under the same name — prevents
     * cross-form cache hits when registrations diverge.
     */
    getLoadedKindComponent(kind: string): Type<unknown> | undefined {
      if (!registry.has(kind)) return undefined;
      return componentCache.get(kind);
    },

    /** Direct read-only access to the registry map. */
    get raw(): ReadonlyMap<string, AddonKindDefinition> {
      return registry;
    },
  };
}
