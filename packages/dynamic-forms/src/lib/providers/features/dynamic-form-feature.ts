import { Provider } from '@angular/core';

/**
 * Base interface for dynamic form features.
 * Features are configuration options that can be passed to provideDynamicForm
 * alongside field type definitions.
 *
 * Uses Angular-style internal marker (ɵkind) to distinguish from field types.
 */
export interface DynamicFormFeature<TKind extends string = string> {
  /** Internal marker to identify this as a feature, not a field type */
  ɵkind: TKind;
  /** Providers to register for this feature */
  ɵproviders: Provider[];
}

/**
 * Type guard to check if a value is a DynamicFormFeature
 */
export function isDynamicFormFeature(value: unknown): value is DynamicFormFeature {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ɵkind' in value &&
    typeof (value as DynamicFormFeature).ɵkind === 'string' &&
    'ɵproviders' in value &&
    Array.isArray((value as DynamicFormFeature).ɵproviders)
  );
}

/**
 * Helper to create a feature with proper typing.
 *
 * `kind` is the discriminant compared by string equality at the
 * provider-resolution site (and in feature-specific type guards). Each
 * feature module owns its own kind literal — no central registry.
 */
export function createFeature<TKind extends string>(kind: TKind, providers: Provider[]): DynamicFormFeature<TKind> {
  return {
    ɵkind: kind,
    ɵproviders: providers,
  };
}
