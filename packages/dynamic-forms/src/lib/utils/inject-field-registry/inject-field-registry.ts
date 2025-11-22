import { inject, Type } from '@angular/core';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../../models/field-type';

/**
 * Injection function for accessing the dynamic form field registry.
 *
 * Provides a convenient API for interacting with registered field types,
 * including type checking, component loading, and registration management.
 * Must be called within an injection context.
 *
 * @returns Object with methods for field registry interaction
 *
 * @example
 * ```typescript
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
 *
 * @example
 * ```typescript
 * // In a service
 * @Injectable()
 * export class FormBuilderService {
 *   private fieldRegistry = injectFieldRegistry();
 *
 *   getAvailableFieldTypes(): string[] {
 *     return this.fieldRegistry.getTypes().map(type => type.name);
 *   }
 * }
 * ```
 *
 * @public
 */
export function injectFieldRegistry() {
  const registry = inject(FIELD_REGISTRY);

  return {
    /**
     * Retrieves a field type definition by its registered name.
     *
     * @param name - The registered name of the field type
     * @returns The field type definition if found, undefined otherwise
     *
     * @example
     * ```typescript
     * const inputType = fieldRegistry.getType('input');
     * if (inputType) {
     *   console.log('Input field type found:', inputType.name);
     * }
     * ```
     */
    getType(name: string): FieldTypeDefinition | undefined {
      return registry.get(name);
    },

    /**
     * Checks if a field type is registered in the registry.
     *
     * @param name - The name of the field type to check
     * @returns True if the field type exists, false otherwise
     *
     * @example
     * ```typescript
     * if (fieldRegistry.hasType('custom-input')) {
     *   // Safe to use custom-input field type
     *   const component = await fieldRegistry.loadTypeComponent('custom-input');
     * }
     * ```
     */
    hasType(name: string): boolean {
      return registry.has(name);
    },

    /**
     * Loads a field type component with support for lazy loading.
     *
     * Handles both synchronous component references and asynchronous
     * dynamic imports. Automatically extracts default exports from ES modules.
     *
     * @param name - The name of the field type to load
     * @returns Promise resolving to the component constructor
     * @throws {Error} When field type is not registered or loading fails
     *
     * @example
     * ```typescript
     * try {
     *   const InputComponent = await fieldRegistry.loadTypeComponent('input');
     *   const componentRef = vcr.createComponent(InputComponent);
     * } catch (error) {
     *   console.error('Failed to load component:', error);
     * }
     * ```
     */
    async loadTypeComponent(name: string): Promise<Type<unknown>> {
      const fieldType = registry.get(name);

      if (!fieldType) {
        throw new Error(`[Dynamic Forms] Field type "${name}" is not registered`);
      }

      // Handle async loading
      if (fieldType.loadComponent) {
        try {
          const result = await fieldType.loadComponent();
          // Handle ES module imports - extract default export if needed
          return (result as any)?.default || result;
        } catch (error) {
          throw new Error(`[Dynamic Forms] Failed to load component for field type "${name}": ${error}`);
        }
      }

      throw new Error(`[Dynamic Forms] Field type "${name}" has no component or loadComponent function`);
    },

    /**
     * Gets all registered field type definitions.
     *
     * @returns Array of all field type definitions in the registry
     *
     * @example
     * ```typescript
     * const allTypes = fieldRegistry.getTypes();
     * const typeNames = allTypes.map(type => type.name);
     * console.log('Available field types:', typeNames);
     * ```
     */
    getTypes(): FieldTypeDefinition[] {
      return Array.from(registry.values());
    },

    /**
     * Registers multiple field types at once.
     *
     * Useful for bulk registration of custom field types. Overwrites
     * existing registrations with the same name.
     *
     * @param types - Array of field type definitions to register
     *
     * @example
     * ```typescript
     * fieldRegistry.registerTypes([
     *   CustomInputType,
     *   CustomSelectType,
     *   CustomDatePickerType
     * ]);
     * ```
     */
    registerTypes(types: FieldTypeDefinition[]): void {
      types.forEach((type) => {
        registry.set(type.name, type);
      });
    },

    /**
     * Provides direct access to the underlying registry Map.
     *
     * Use with caution - direct modification can affect form behavior.
     * Primarily intended for advanced use cases and debugging.
     *
     * @returns The raw Map containing field type registrations
     *
     * @example
     * ```typescript
     * const rawRegistry = fieldRegistry.raw;
     * console.log('Registry size:', rawRegistry.size);
     * ```
     */
    get raw() {
      return registry;
    },
  };
}
