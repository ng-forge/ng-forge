import { inject, Type } from '@angular/core';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../../models/field-type';

/**
 * Wrapper function to inject and interact with the field registry
 */
export function injectFieldRegistry() {
  const registry = inject(FIELD_REGISTRY);

  return {
    /**
     * Get a field type definition by name
     */
    getType(name: string): FieldTypeDefinition | undefined {
      return registry.get(name);
    },

    /**
     * Check if a field type is registered
     */
    hasType(name: string): boolean {
      return registry.has(name);
    },

    /**
     * Load a field type component (handles both sync and async)
     */
    async loadTypeComponent(name: string): Promise<Type<unknown>> {
      const fieldType = registry.get(name);

      if (!fieldType) {
        throw new Error(`Field type "${name}" is not registered`);
      }

      // Handle async loading
      if (fieldType.loadComponent) {
        try {
          return await fieldType.loadComponent();
        } catch (error) {
          throw new Error(`Failed to load component for field type "${name}": ${error}`);
        }
      }

      throw new Error(`Field type "${name}" has no component or loadComponent function`);
    },

    /**
     * Get all registered field types
     */
    getTypes(): FieldTypeDefinition[] {
      return Array.from(registry.values());
    },

    /**
     * Register multiple field types
     */
    registerTypes(types: FieldTypeDefinition[]): void {
      types.forEach((type) => {
        registry.set(type.name, type);
      });
    },

    /**
     * Access the raw registry map
     */
    get raw() {
      return registry;
    },
  };
}
