import { inject, Type } from '@angular/core';
import { DynamicFormError } from '@ng-forge/dynamic-forms/internal';
import { ADDON_KIND_COMPONENT_CACHE, ADDON_KIND_REGISTRY, AddonKindDefinition } from '@ng-forge/dynamic-forms/internal';
import { resolveDefaultExport } from '../wrapper-chain/wrapper-chain';

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

/** Injection function for accessing the addon kind registry. */
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
        throw new DynamicFormError(
          `Failed to load component for addon kind '${kind}': ${error instanceof Error ? error.message : String(error)}`,
        );
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
