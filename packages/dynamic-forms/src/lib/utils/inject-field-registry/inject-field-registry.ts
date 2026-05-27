import { inject, InjectionToken, Type } from '@angular/core';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../../models/field-type';
import { resolveDefaultExport } from '../wrapper-chain/wrapper-chain';

/**
 * Cache for resolved field type components.
 *
 * @internal
 */
export const COMPONENT_CACHE = new InjectionToken<Map<string, Type<unknown>>>('COMPONENT_CACHE', {
  providedIn: 'root',
  factory: () => new Map(),
});

/**
 * Injection function for accessing the dynamic form field registry.
 *
 * @returns Object with methods for field registry interaction
 * @Component({...})
 * export class MyComponent {
 *   private fieldRegistry = injectFieldRegistry();
 *
 *   async loadCustomField() {
 *     if (this.fieldRegistry.hasType('custom-input')) {
 *       const component = await this.fieldRegistry.loadTypeComponent('custom-input');
 *       // Use component...
 *     }
 *   }
 * }
 * ```
 * @Injectable()
 * export class FormBuilderService {
 *   private fieldRegistry = injectFieldRegistry();
 *
 *   getAvailableFieldTypes(): string[] {
 *     return this.fieldRegistry.getTypes().map(type => type.name);
 *   }
 * }
 * ```
 */
export function injectFieldRegistry() {
  const registry = inject(FIELD_REGISTRY);
  const componentCache = inject(COMPONENT_CACHE);

  return {
    /**
     * Retrieves a field type definition by its registered name.
     *
     * @param name - The registered name of the field type
     * @returns The field type definition if found, undefined otherwise
     */
    getType(name: string): FieldTypeDefinition | undefined {
      return registry.get(name);
    },

    /**
     * Checks if a field type is registered in the registry.
     *
     * @param name - The name of the field type to check
     * @returns True if the field type exists, false otherwise
     */
    hasType(name: string): boolean {
      return registry.has(name);
    },

    /**
     * Loads a field type component with support for lazy loading.
     *
     * @param name - The name of the field type to load
     * @returns Promise resolving to the component constructor, or undefined for componentless fields
     * @throws {Error} When field type is not registered or loading fails
     */
    async loadTypeComponent(name: string): Promise<Type<unknown> | undefined> {
      const fieldType = registry.get(name);

      if (!fieldType) {
        throw new DynamicFormError(`Field type "${name}" is not registered`);
      }

      // Componentless field types (e.g., hidden) don't have loadComponent
      if (!fieldType.loadComponent) {
        return undefined;
      }

      // Check cache first for instant resolution
      const cached = componentCache.get(name);
      if (cached) {
        return cached;
      }

      try {
        const component = resolveDefaultExport(await fieldType.loadComponent());

        if (component) {
          componentCache.set(name, component);
        }

        return component;
      } catch (error) {
        throw new DynamicFormError(`Failed to load component for field type "${name}": ${error}`);
      }
    },

    /**
     * Returns a previously loaded component from cache, or undefined if not yet loaded.
     *
     * @param name - The name of the field type
     * @returns The cached component constructor, or undefined
     */
    getLoadedComponent(name: string): Type<unknown> | undefined {
      return componentCache.get(name);
    },

    /**
     * Gets all registered field type definitions.
     *
     * @returns Array of all field type definitions in the registry
     */
    getTypes(): FieldTypeDefinition[] {
      return Array.from(registry.values());
    },

    /**
     * Registers multiple field types at once.
     *
     * @param types - Array of field type definitions to register
     */
    registerTypes(types: FieldTypeDefinition[]): void {
      types.forEach((type) => {
        registry.set(type.name, type);
      });
    },

    /**
     * Provides direct access to the underlying registry Map.
     *
     * @returns The raw Map containing field type registrations
     */
    get raw() {
      return registry;
    },
  };
}
