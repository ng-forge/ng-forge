import { Injectable, Type } from '@angular/core';
import { FieldTypeDefinition, FieldWrapperDefinition } from '../models/field-type';

/**
 * Registry for field types and wrappers
 */
@Injectable({ providedIn: 'root' })
export class FieldRegistry {
  private types = new Map<string, FieldTypeDefinition>();
  private wrappers = new Map<string, FieldWrapperDefinition>();
  private loadingCache = new Map<string, Promise<Type<unknown>>>();

  /**
   * Register a field type
   */
  registerType(type: FieldTypeDefinition): void {
    if (this.types.has(type.name)) {
      console.warn(`Field type "${type.name}" is already registered. Overwriting.`);
    }
    this.types.set(type.name, type);
  }

  /**
   * Register multiple field types
   */
  registerTypes(types: FieldTypeDefinition[]): void {
    types.forEach(type => this.registerType(type));
  }

  /**
   * Get a field type by name
   */
  getType(name: string): FieldTypeDefinition | undefined {
    let type = this.types.get(name);
    
    // Resolve inheritance chain
    if (type?.extends) {
      const parentType = this.getType(type.extends);
      if (parentType) {
        type = this.mergeTypes(parentType, type);
      }
    }
    
    return type;
  }

  /**
   * Get all registered field types
   */
  getTypes(): FieldTypeDefinition[] {
    return Array.from(this.types.values());
  }

  /**
   * Check if a field type is registered
   */
  hasType(name: string): boolean {
    return this.types.has(name);
  }

  /**
   * Load a field type component (handles lazy loading)
   */
  async loadTypeComponent(name: string): Promise<Type<unknown>> {
    const type = this.getType(name);
    
    if (!type) {
      throw new Error(`Field type "${name}" is not registered`);
    }

    // Return eagerly loaded component
    if (type.component) {
      return type.component;
    }

    // Handle lazy loading
    if (type.loadComponent) {
      // Check cache
      if (this.loadingCache.has(name)) {
        return this.loadingCache.get(name)!;
      }

      // Load component
      const loadPromise = type.loadComponent();
      this.loadingCache.set(name, loadPromise);

      try {
        const component = await loadPromise;
        return component;
      } catch (error) {
        this.loadingCache.delete(name);
        throw new Error(`Failed to load component for field type "${name}": ${error}`);
      }
    }

    throw new Error(`Field type "${name}" has no component or loadComponent function`);
  }

  /**
   * Register a field wrapper
   */
  registerWrapper(wrapper: FieldWrapperDefinition): void {
    if (this.wrappers.has(wrapper.name)) {
      console.warn(`Wrapper "${wrapper.name}" is already registered. Overwriting.`);
    }
    this.wrappers.set(wrapper.name, wrapper);
  }

  /**
   * Register multiple wrappers
   */
  registerWrappers(wrappers: FieldWrapperDefinition[]): void {
    wrappers.forEach(wrapper => this.registerWrapper(wrapper));
  }

  /**
   * Get a wrapper by name
   */
  getWrapper(name: string): FieldWrapperDefinition | undefined {
    return this.wrappers.get(name);
  }

  /**
   * Get all registered wrappers
   */
  getWrappers(): FieldWrapperDefinition[] {
    return Array.from(this.wrappers.values())
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  /**
   * Check if a wrapper is registered
   */
  hasWrapper(name: string): boolean {
    return this.wrappers.has(name);
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.types.clear();
    this.wrappers.clear();
    this.loadingCache.clear();
  }

  /**
   * Merge parent and child type definitions
   */
  private mergeTypes(
    parent: FieldTypeDefinition,
    child: FieldTypeDefinition
  ): FieldTypeDefinition {
    return {
      ...parent,
      ...child,
      defaultProps: {
        ...parent.defaultProps,
        ...child.defaultProps,
      },
      wrappers: [
        ...(parent.wrappers ?? []),
        ...(child.wrappers ?? []),
      ],
      validators: [
        ...(parent.validators ?? []),
        ...(child.validators ?? []),
      ],
    };
  }
}
