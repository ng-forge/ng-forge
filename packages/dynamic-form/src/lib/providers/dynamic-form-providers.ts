import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer, Provider } from '@angular/core';
import { FieldRegistry } from '../core/field-registry';
import { ConfigMerger, DynamicFormConfig } from '../core/config-merger';
import { FormBuilder } from '../core/form-builder';

type Providers = (EnvironmentProviders | Provider)[];

/**
 * Configuration feature for dynamic forms
 */
export interface DynamicFormFeature {
  providers: Providers;
}

/**
 * Provide dynamic form functionality
 */
export function provideDynamicForm(...features: DynamicFormFeature[]): EnvironmentProviders {
  const providers: Providers = [
    // Core services
    FieldRegistry,
    ConfigMerger,
    FormBuilder,

    // Feature providers
    ...features.flatMap((feature) => feature.providers),
  ];

  return makeEnvironmentProviders(providers);
}

/**
 * Configure dynamic forms with custom configuration
 */
export function withConfig(config: DynamicFormConfig): DynamicFormFeature {
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
  };
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
