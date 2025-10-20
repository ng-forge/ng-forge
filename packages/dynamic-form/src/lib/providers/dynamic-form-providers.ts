import { EnvironmentProviders, makeEnvironmentProviders, Provider, APP_INITIALIZER } from '@angular/core';
import { FieldRegistry } from '../core/field-registry';
import { ConfigMerger, DynamicFormConfig } from '../core/config-merger';
import { FormBuilder } from '../core/form-builder';

/**
 * Configuration feature for dynamic forms
 */
export interface DynamicFormFeature {
  providers: Provider[];
}

/**
 * Provide dynamic form functionality
 */
export function provideDynamicForm(
  ...features: DynamicFormFeature[]
): EnvironmentProviders {
  const providers: Provider[] = [
    // Core services
    FieldRegistry,
    ConfigMerger,
    FormBuilder,
    
    // Feature providers
    ...features.flatMap(feature => feature.providers),
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
      {
        provide: APP_INITIALIZER,
        useFactory: (registry: FieldRegistry, merger: ConfigMerger) => {
          return () => {
            const mergedConfig = merger.merge(config);
            
            if (mergedConfig.types) {
              registry.registerTypes(mergedConfig.types);
            }
            
            if (mergedConfig.wrappers) {
              registry.registerWrappers(mergedConfig.wrappers);
            }
          };
        },
        deps: [FieldRegistry, ConfigMerger],
        multi: true,
      },
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
