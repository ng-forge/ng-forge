import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer, Provider } from '@angular/core';
import { FieldRegistry } from '../core/field-registry';
import { ConfigMerger, DynamicFormConfig } from '../core/config-merger';
import { FormBuilder } from '../core/form-builder';
import type { InferenceFieldConfig, InferFormResult, Prettify } from '../utils/field.type';

type Providers = (EnvironmentProviders | Provider)[];

/**
 * Configuration feature for dynamic forms
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
 * Provide dynamic form functionality
 *
 * The return value carries a phantom `__result` type if any feature provides it,
 * allowing consumers to extract the inferred type via `ProvidedFormResult`.
 */
export function provideDynamicForm<Features extends readonly DynamicFormFeature[]>(
  ...features: Features
): EnvironmentProviders & {
  __result?: InferFeaturesResult<Features>;
} {
  const providers: Providers = [
    // Core services
    FieldRegistry,
    ConfigMerger,
    FormBuilder,

    // Feature providers
    ...features.flatMap((feature) => feature.providers),
  ];

  // runtime value is still EnvironmentProviders; the phantom types are compile-time only
  return makeEnvironmentProviders(providers) as EnvironmentProviders & {
    __result?: InferFeaturesResult<Features>;
  };
}

/**
 * Configure dynamic forms with custom configuration
 *
 * If the provided `config` includes a `fields` property, the result type will be inferred.
 */
export function withConfig<TConfig extends DynamicFormConfig>(
  config: TConfig
): DynamicFormFeatureWithModel<
  TConfig extends { fields: infer F } ? (F extends readonly InferenceFieldConfig[] ? Prettify<InferFormResult<F>> : unknown) : unknown
> {
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
  } as DynamicFormFeatureWithModel<
    TConfig extends { fields: infer F } ? (F extends readonly InferenceFieldConfig[] ? Prettify<InferFormResult<F>> : unknown) : unknown
  >;
}

/**
 * Enhanced configuration with type inference support
 */
export function withTypedConfig<TFields extends readonly InferenceFieldConfig[]>(
  config: DynamicFormConfig & {
    fields: TFields;
  }
): DynamicFormFeatureWithModel<Prettify<InferFormResult<TFields>>> {
  return withConfig(config) as DynamicFormFeatureWithModel<Prettify<InferFormResult<TFields>>>;
}

/**
 * Add validation configuration
 */
export function withValidation(config: {
  validators?: Record<string, unknown>;
  errorMessages?: Record<string, string | ((error: unknown, field: unknown) => string)>;
}): DynamicFormFeature {
  return {
    providers: [
      {
        provide: 'VALIDATION_CONFIG',
        useValue: config,
      },
    ],
  };
}

/**
 * Add internationalization support
 */
export function withTranslation(config: {
  defaultLanguage: string;
  availableLanguages: string[];
  translationService?: 'transloco' | 'ngx-translate';
}): DynamicFormFeature {
  return {
    providers: [
      {
        provide: 'TRANSLATION_CONFIG',
        useValue: config,
      },
    ],
  };
}

/**
 * Helper: extract the inferred result type from the value returned by `provideDynamicForm`
 *
 * Example usage:
 * const providers = provideDynamicForm(withConfig({ fields: [...] as const }));
 * type FormResult = ProvidedFormResult<typeof providers>;
 * // This gives you the typed result based on field configurations
 */
export type ProvidedFormResult<T> = T extends { __result?: infer R } ? R : unknown;
