import { InjectionToken, Signal, Type, ViewContainerRef } from '@angular/core';
import { FieldRegistryWrappers, RegisteredWrapperTypes } from './registry/field-registry';

/**
 * Resolves a wrapper type name to its registered config interface.
 *
 * When `TWrappers` is a specific registered key (e.g., `'css'`), resolves to
 * the full config type from `FieldRegistryWrappers` (e.g., `CssWrapper`),
 * providing type-safe access to wrapper-specific properties like `cssClasses`.
 *
 * When `TWrappers` is the full `RegisteredWrapperTypes` union, distributes
 * to produce a discriminated union of all registered wrapper configs.
 *
 * @example
 * ```typescript
 * // Resolves to CssWrapper — cssClasses is typed
 * type CssConfig = WrapperConfig<'css'>;
 *
 * // Union of all registered wrapper configs
 * type AnyConfig = WrapperConfig;
 * ```
 */

export type WrapperConfig<TWrappers extends RegisteredWrapperTypes = RegisteredWrapperTypes> = TWrappers extends keyof FieldRegistryWrappers
  ? FieldRegistryWrappers[TWrappers]
  : { readonly type: TWrappers };

/**
 * Signature of a lazy component loader — either a direct component class or
 * an ES module whose `default` export is the component. Shared by field and
 * wrapper registrations so the `loadComponent: () => import('./x.component')`
 * idiom types cleanly in both places.
 */
export type LazyComponentLoader<T = unknown> = () => Promise<Type<T> | { default: Type<T> }>;

/**
 * Pre-computed reverse index used by `resolveWrappers`: field type → the
 * wrappers that auto-apply to it. Built once in the `provideDynamicForm(...)`
 * factory from every registered `WrapperTypeDefinition.types` entry.
 */
export type WrapperAutoAssociations = ReadonlyMap<string, readonly WrapperConfig[]>;

/**
 * Configuration interface for registering wrapper types.
 *
 * Defines how a wrapper component is loaded and identified. Wrapper components
 * provide visual decoration around field content (sections, headers, styling)
 * without affecting the form data structure.
 *
 * @example
 * ```typescript
 * const SectionWrapper: WrapperTypeDefinition = {
 *   name: 'section',
 *   loadComponent: () => import('./section-wrapper.component').then(m => m.SectionWrapperComponent),
 * };
 * ```
 */
export interface WrapperTypeDefinition<T extends WrapperConfig = WrapperConfig> {
  /** Unique identifier for the wrapper type (also serves as discriminant from FieldTypeDefinition) */
  wrapperName: string;
  /** Wrapper definition type marker (internal use) */
  _wrapper?: T;
  /**
   * Function to load the wrapper component (supports lazy loading).
   * Returns a Promise that resolves to the component class or module with default export.
   */
  loadComponent: LazyComponentLoader;
  /**
   * Field types this wrapper should auto-apply to.
   *
   * When a field's `type` matches any entry, the wrapper is injected into that
   * field's effective wrapper chain at the lowest priority (can be overridden
   * by `FormConfig.defaultWrappers` or the field-level `wrappers` array, and
   * fully cleared with `wrappers: null`).
   */
  types?: readonly string[];
}

/**
 * Type guard for WrapperTypeDefinition.
 *
 * Discriminates via `wrapperName` — field types use `name`, wrapper types use `wrapperName`.
 */
export function isWrapperTypeDefinition(value: unknown): value is WrapperTypeDefinition {
  return typeof value === 'object' && value !== null && 'wrapperName' in value;
}

/**
 * Contract that wrapper components must satisfy.
 *
 * Each wrapper exposes a `#fieldComponent` ViewContainerRef where the inner
 * content (next wrapper, or the field) is rendered imperatively. Config
 * properties (minus `type`) are set on the component via `setInput`; a
 * wrapper opts into a key by declaring a matching `input()`, and unknown
 * keys are silently dropped. Wrappers may additionally declare a
 * `fieldInputs` input for the wrapped field's mapper outputs (see
 * `WrapperFieldInputs` for when that's undefined).
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <dbx-section [header]="header() ?? ''">
 *       <ng-container #fieldComponent></ng-container>
 *     </dbx-section>
 *   `,
 * })
 * export class SectionWrapperComponent implements FieldWrapperContract {
 *   readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
 *   readonly header = input<string>();
 *   readonly fieldInputs = input<WrapperFieldInputs>();
 * }
 * ```
 */
export interface FieldWrapperContract {
  /** ViewContainerRef slot where inner content is rendered */
  readonly fieldComponent: Signal<ViewContainerRef>;
}

/**
 * Injection token for the wrapper type registry.
 *
 * Provides access to the map of registered wrapper types. The registry is
 * populated via `provideDynamicForm()` and used by `ContainerFieldComponent` to
 * resolve wrapper types to their component implementations.
 */
export const WRAPPER_REGISTRY = new InjectionToken<Map<string, WrapperTypeDefinition>>('WRAPPER_REGISTRY', {
  providedIn: 'root',
  factory: () => new Map(),
});

/**
 * Component cache for loaded wrapper components.
 *
 * Caches resolved wrapper component classes for instant re-resolution.
 * SSR-safe because it's DI-scoped, not module-scoped.
 *
 * NOTE: The cache grows across the application lifetime. It's bounded by the
 * number of wrapper types registered (typically small), so this is not a leak;
 * the COMPONENT_CACHE for field types has the same shape.
 */
export const WRAPPER_COMPONENT_CACHE = new InjectionToken<Map<string, Type<unknown>>>('WRAPPER_COMPONENT_CACHE', {
  providedIn: 'root',
  factory: () => new Map(),
});

/**
 * Pre-computed reverse index: `fieldType → WrapperConfig[]` for every
 * registered `WrapperTypeDefinition.types` entry. Built once in the
 * `provideDynamicForm(...)` factory so `resolveWrappers` can look up
 * auto-associations in O(1) per field instead of scanning the full
 * wrapper registry on every render.
 */
export const WRAPPER_AUTO_ASSOCIATIONS = new InjectionToken<WrapperAutoAssociations>('WRAPPER_AUTO_ASSOCIATIONS', {
  providedIn: 'root',
  factory: () => new Map(),
});
