import { inject, Type } from '@angular/core';
import { DynamicFormError } from '../errors/dynamic-form-error';
import { ADDON_TYPE_COMPONENT_CACHE, ADDON_TYPE_REGISTRY, AddonTypeDefinition } from '../models/addon/addon-type';

/** Pick the component class out of whatever a lazy loader returned. */
function resolveDefaultExport<T>(result: Type<T> | { default: Type<T> }): Type<T> {
  return typeof result === 'object' && result !== null && 'default' in result ? result.default : result;
}

/**
 * Public shape returned by {@link injectAddonTypeRegistry}. Pinned explicitly
 * so the API extractor doesn't churn between versions when the inner factory
 * gets refactored.
 */
export interface AddonTypeRegistryRef {
  getType(type: string): AddonTypeDefinition | undefined;
  hasType(type: string): boolean;
  getTypeNames(): string[];
  loadTypeComponent(type: string): Promise<Type<unknown>>;
  getLoadedTypeComponent(type: string): Type<unknown> | undefined;
  readonly raw: ReadonlyMap<string, AddonTypeDefinition>;
}

/** Injection function for accessing the addon type registry. */
export function injectAddonTypeRegistry(): AddonTypeRegistryRef {
  const registry = inject(ADDON_TYPE_REGISTRY);
  const componentCache = inject(ADDON_TYPE_COMPONENT_CACHE);

  return {
    /** Look up a type definition by its discriminant. */
    getType(type: string): AddonTypeDefinition | undefined {
      return registry.get(type);
    },

    /** Whether a type is currently registered. */
    hasType(type: string): boolean {
      return registry.has(type);
    },

    /** All registered type names — useful for actionable validator warnings. */
    getTypeNames(): string[] {
      return Array.from(registry.keys());
    },

    /**
     * Resolve a type to its renderer component. Caches on first resolution.
     *
     * @throws DynamicFormError when the type is not registered.
     */
    async loadTypeComponent(type: string): Promise<Type<unknown>> {
      const definition = registry.get(type);
      if (!definition) {
        const known = Array.from(registry.keys()).join(', ') || '(none)';
        throw new DynamicFormError(`Addon type '${type}' is not registered. Currently registered types: ${known}.`);
      }

      const cached = componentCache.get(type);
      if (cached) {
        return cached;
      }

      try {
        const component = resolveDefaultExport(await definition.loadComponent());
        if (component) {
          componentCache.set(type, component);
          return component;
        }
        throw new DynamicFormError(`Addon type '${type}' loadComponent resolved to null.`);
      } catch (error) {
        if (error instanceof DynamicFormError) throw error;
        throw new DynamicFormError(
          `Failed to load component for addon type '${type}': ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },

    /**
     * Synchronous lookup of an already-loaded type component, or undefined.
     * Returns `undefined` when the type isn't registered in this scope even
     * if a prior scope cached a component under the same name — prevents
     * cross-form cache hits when registrations diverge.
     */
    getLoadedTypeComponent(type: string): Type<unknown> | undefined {
      if (!registry.has(type)) return undefined;
      return componentCache.get(type);
    },

    /** Direct read-only access to the registry map. */
    get raw(): ReadonlyMap<string, AddonTypeDefinition> {
      return registry;
    },
  };
}
