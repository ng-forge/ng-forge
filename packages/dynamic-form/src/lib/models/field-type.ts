import { InjectionToken } from '@angular/core';
import { FieldDef } from '../definitions';
import { MapperFn } from '../mappers';

/**
 * Configuration interface for registering custom field types.
 *
 * Defines how a field type should be handled by the dynamic form system,
 * including its component loading strategy and field-to-component mapping logic.
 * Supports both eager-loaded and lazy-loaded components.
 *
 * @typeParam T - The field definition type this field type handles
 *
 * @example
 * ```typescript
 * const CustomInputType: FieldTypeDefinition<InputFieldDef> = {
 *   name: 'custom-input',
 *   loadComponent: () => import('./custom-input.component').then(m => m.CustomInputComponent),
 *   mapper: customInputMapper
 * };
 *
 * // Register with providers
 * provideDynamicForm(CustomInputType)
 * ```
 */
export interface FieldTypeDefinition<T extends FieldDef<Record<string, unknown>> = any> {
  /** Unique identifier for the field type */
  name: string;
  /** Field definition type marker (internal use) */
  _fieldDef?: T;
  /** Function to load the component (supports lazy loading) */
  loadComponent?: () => Promise<any>;
  /** Mapper function that converts field definition to component bindings */
  mapper: MapperFn<T>;
}

/**
 * Injection token for the global field type registry.
 *
 * Provides access to the map of registered field types throughout the application.
 * The registry is populated by the provideDynamicForm function and used by
 * field rendering components to resolve field types to their implementations.
 *
 * @example
 * ```typescript
 * constructor(@Inject(FIELD_REGISTRY) private registry: Map<string, FieldTypeDefinition>) {
 *   const inputType = registry.get('input');
 * }
 * ```
 */
export const FIELD_REGISTRY = new InjectionToken<Map<string, FieldTypeDefinition>>('FIELD_REGISTRY', {
  providedIn: 'root',
  factory: () => new Map(),
});
