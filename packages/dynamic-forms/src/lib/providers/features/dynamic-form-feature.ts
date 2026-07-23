import { Provider } from '@angular/core';

/**
 * Base interface for dynamic form features.
 * Features are configuration options that can be passed to provideDynamicForm
 * alongside field type definitions.
 */
export interface DynamicFormFeature<TKind extends string = string> {
  /** Internal marker to identify this as a feature, not a field type */
  ɵkind: TKind;
  /** Providers to register for this feature */
  ɵproviders: Provider[];
}

/**
 * Known feature kinds for type safety. Adapter feature modules (and the
 * addon system) contribute their own discriminants via module augmentation.
 */
export type DynamicFormFeatureKind =
  | 'logger'
  | 'event-form-value'
  | 'value-exclusion'
  | 'validation-execution'
  | 'legacy-status-classes'
  | 'page-preload'
  | 'addons'
  | 'addon-actions';

/** Type guard to check if a value is a DynamicFormFeature */
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

/** Helper to create a feature with proper typing. */
export function createFeature<TKind extends string>(kind: TKind, providers: Provider[]): DynamicFormFeature<TKind> {
  return {
    ɵkind: kind,
    ɵproviders: providers,
  };
}
