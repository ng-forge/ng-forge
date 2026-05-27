import { InjectionToken } from '@angular/core';
import { FieldDef } from '../definitions/base/field-def';
import { MapperFn } from '../mappers/types';
import { FieldAddonSupport } from './addon/addon-kind';
import { LazyComponentLoader } from './wrapper-type';

/** Defines how a field type handles form values and data collection. */
export type ValueHandlingMode = 'include' | 'exclude' | 'flatten';

/** Semantic grouping of interchangeable field UI alternatives. */
export type FieldScope = 'boolean' | 'single-select' | 'multi-select' | 'text-input' | 'numeric' | 'date';

/** Mapped component inputs that must be available before a field component is instantiated. */
export type RenderReadyInput = 'field' | (string & {});

/**
 * Configuration interface for registering custom field types.
 *
 * @typeParam T - The field definition type this field type handles
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
   */
  loadComponent?: LazyComponentLoader;
  /** Mapper function that converts field definition to component bindings. */
  mapper?: MapperFn<T>;
  /** How this field type handles form values and data collection (defaults to 'include') */
  valueHandling?: ValueHandlingMode;
  /** List of prop keys to forward to the meta object. */
  propsToMeta?: string[];
  /** Semantic scope for tooling to discover interchangeable field alternatives */
  scope?: FieldScope | FieldScope[];
  /** Mapped component inputs that must exist before the renderer instantiates the component */
  renderReadyWhen?: readonly RenderReadyInput[];

  /**
   * Declares which addon slots this field accepts and (optionally) the
   * subset of kinds allowed.
   */
  addons?: FieldAddonSupport;
}

/** Injection token for the global field type registry. */
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
