import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer, Provider } from '@angular/core';
import { FieldRegistry } from '../core/field-registry';
import { FieldDef, InferFormValue } from '../models/field-config';
import { ConfigMerger } from '../core';
import { withBuiltInFields } from './built-in-fields';

type Providers = (EnvironmentProviders | Provider)[];

/**
 * Configuration feature for dynamic forms following Angular Architects pattern
 */
export interface DynamicFormFeature {
  providers: Providers;
}

/**
 * Phantom-typed feature that can carry inferred result type
 */
export type DynamicFormFeatureWithModel<TResult = unknown> = DynamicFormFeature & {
  /** Phantom property used only for type inference of output result */
  __result?: TResult;
};

/**
 * Dynamic form configuration following Angular Architects pattern
 */
export interface DynamicFormConfig<TFields extends readonly FieldDef[] = readonly FieldDef[]> {
  readonly fields: TFields;
}

/**
 * Extract a result type from a single feature
 */
export type InferFeatureResult<F> = F extends { __result?: infer R } ? R : unknown;

/**
 * Extract the union of results from an array of features
 */
export type InferFeaturesResult<Features extends readonly DynamicFormFeature[]> = InferFeatureResult<Features[number]> extends never
  ? unknown
  : InferFeatureResult<Features[number]>;

/**
 * Provide dynamic form functionality following Angular Architects pattern
 * Clean, minimal provider setup
 */
export function provideDynamicForm<Features extends readonly DynamicFormFeature[]>(
  ...features: Features
): EnvironmentProviders & {
  __result?: InferFeaturesResult<Features>;
} {
  const providers: Providers = [
    // Core services - simplified
    FieldRegistry,

    // Built-in field types - always included
    ...withBuiltInFields().providers,

    // Feature providers
    ...features.flatMap((feature) => feature.providers),
  ];

  return makeEnvironmentProviders(providers) as EnvironmentProviders & {
    __result?: InferFeaturesResult<Features>;
  };
}

/**
 * Configure dynamic forms with field definitions
 * Following Angular Architects signal forms pattern
 */
export function withConfig<TFields extends readonly FieldDef[]>(
  config: DynamicFormConfig<TFields>
): DynamicFormFeatureWithModel<InferFormValue<TFields>> {
  return {
    providers: [
      {
        provide: 'DYNAMIC_FORM_CONFIG',
        useValue: config,
      },
      provideAppInitializer((): void => {
        const registry = inject(FieldRegistry);
        const merger = inject(ConfigMerger);

        const mergedConfig = merger.merge(config);

        if (mergedConfig.types) {
          registry.registerTypes(mergedConfig.types);
        }

        if (mergedConfig.wrappers) {
          registry.registerWrappers(mergedConfig.wrappers);
        }
      }),
    ],
  } as DynamicFormFeatureWithModel<InferFormValue<TFields>>;
}

/**
 * Helper: extract the inferred result type from the value returned by `provideDynamicForm`
 *
 * Example usage:
 * ```typescript
 * const providers = provideDynamicForm(withConfig({
 *   definitions: [
 *     { key: 'name', type: 'input', label: 'Name' },
 *     { key: 'email', type: 'input', label: 'Email' }
 *   ] as const
 * }));
 * type FormResult = ProvidedFormResult<typeof providers>;
 * // FormResult = { name: unknown; email: unknown; }
 * ```
 */
export type ProvidedFormResult<T> = T extends { __result?: infer R } ? R : unknown;
