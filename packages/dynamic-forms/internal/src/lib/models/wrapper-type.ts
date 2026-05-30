import { InjectionToken, Signal, Type, ViewContainerRef } from '@angular/core';
import { FieldRegistryWrappers, RegisteredWrapperTypes } from './registry/field-registry';

/** Resolves a wrapper type name to its registered config interface. */

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

/** Configuration interface for registering wrapper types. */
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
  /** Field types this wrapper should auto-apply to. */
  types?: readonly string[];
}

/** Type guard for WrapperTypeDefinition. */
export function isWrapperTypeDefinition(value: unknown): value is WrapperTypeDefinition {
  return typeof value === 'object' && value !== null && 'wrapperName' in value;
}

/**
 * Contract that wrapper components must satisfy.
 *
 * @Component({
 *   template: `
 *     <dbx-section [header]="header() ?? ''">
 *       <ng-container #fieldComponent></ng-container>
 *     </dbx-section>
 *   `,
 * })
 * export class SectionWrapperComponent implements FieldWrapper {
 *   readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
 *   readonly header = input<string>();
 *   readonly fieldInputs = input<WrapperFieldInputs>();
 * }
 * ```
 */
export interface FieldWrapper {
  /** ViewContainerRef slot where inner content is rendered */
  readonly fieldComponent: Signal<ViewContainerRef>;
}

/** Injection token for the wrapper type registry. */
export const WRAPPER_REGISTRY = new InjectionToken<Map<string, WrapperTypeDefinition>>('WRAPPER_REGISTRY', {
  providedIn: 'root',
  factory: () => new Map(),
});

/** Component cache for loaded wrapper components. */
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
