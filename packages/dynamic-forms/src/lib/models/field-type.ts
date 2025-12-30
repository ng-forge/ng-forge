import { InjectionToken } from '@angular/core';
import { FieldDef } from '../definitions/base/field-def';
import { MapperFn } from '../mappers/types';

/**
 * Defines how a field type handles form values and data collection.
 *
 * - 'include': Field contributes to form values (default for input fields)
 * - 'exclude': Field is excluded from form values (for display/layout fields)
 * - 'flatten': Field's children are flattened to parent level (for container fields)
 */
export type ValueHandlingMode = 'include' | 'exclude' | 'flatten';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Intentionally using `any` for maximum flexibility in field type registration
export interface FieldTypeDefinition<T extends FieldDef<any> = any> {
  /** Unique identifier for the field type */
  name: string;
  /** Field definition type marker (internal use) */
  _fieldDef?: T;
  /**
   * Function to load the component (supports lazy loading).
   * Returns a Promise that resolves to the component class or module with default export.
   *
   * Optional - omit for componentless fields (e.g., hidden fields) that only
   * contribute to form values without rendering any UI.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Component loading returns dynamic module structure
  loadComponent?: () => Promise<any>;
  /**
   * Mapper function that converts field definition to component bindings.
   *
   * Optional - omit for componentless fields (like hidden fields) that don't need
   * input mapping. When omitted for componentless fields (no loadComponent), an empty
   * signal is returned. When omitted for regular fields with a component, falls back
   * to baseFieldMapper.
   */
  mapper?: MapperFn<T>;
  /** How this field type handles form values and data collection (defaults to 'include') */
  valueHandling?: ValueHandlingMode;
  /**
   * List of prop keys to forward to the meta object.
   *
   * Some props (like `type` for inputs, `rows`/`cols` for textareas) are actually
   * native HTML attributes. Specifying them here causes them to be merged into
   * the meta object before being passed to the component, ensuring they're applied
   * via the meta tracking mechanism.
   *
   * Note: Meta values always take precedence over forwarded props.
   *
   * @example
   * ```typescript
   * {
   *   name: 'input',
   *   propsToMeta: ['type'],
   *   // ...
   * }
   * ```
   */
  propsToMeta?: string[];
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

/**
 * Gets the value handling mode for a specific field type from the registry.
 *
 * @param fieldType - The field type identifier
 * @param registry - The field type registry
 * @returns The value handling mode ('include' is the default if not specified)
 */
export function getFieldValueHandling(fieldType: string, registry: Map<string, FieldTypeDefinition>): ValueHandlingMode {
  const definition = registry.get(fieldType);
  return definition?.valueHandling ?? 'include';
}
