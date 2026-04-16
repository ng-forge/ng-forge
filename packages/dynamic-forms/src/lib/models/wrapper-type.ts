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
export interface WrapperTypeDefinition<T extends WrapperConfig<any> = WrapperConfig<any>> {
  /** Unique identifier for the wrapper type (also serves as discriminant from FieldTypeDefinition) */
  wrapperName: string;
  /** Wrapper definition type marker (internal use) */
  _wrapper?: T;
  /**
   * Function to load the wrapper component (supports lazy loading).
   * Returns a Promise that resolves to the component class or module with default export.
   */
  loadComponent: () => Promise<Type<unknown> | { default: Type<unknown> }>;
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
 * Each wrapper component provides a `#fieldComponent` ViewContainerRef where
 * inner content (the next wrapper in the chain, or the children) will be
 * rendered imperatively by `ContainerFieldComponent`.
 *
 * The wrapper itself is unaware of what gets rendered inside it — it just
 * provides the slot and its own UI chrome.
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <dbx-section [header]="header()">
 *       <ng-container #fieldComponent></ng-container>
 *     </dbx-section>
 *   `,
 * })
 * export class SectionWrapperComponent implements FieldWrapperContract {
 *   readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
 *   private readonly context = inject(WRAPPER_CONTEXT);
 *   readonly header = computed(() => this.context.config['header'] as string);
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
 */
export const WRAPPER_COMPONENT_CACHE = new InjectionToken<Map<string, Type<unknown>>>('WRAPPER_COMPONENT_CACHE', {
  providedIn: 'root',
  factory: () => new Map(),
});
