import { FieldTypeDefinition, FieldTypeDefinitionWithConfig } from '@ng-forge/dynamic-form';
import { PRIMENG_FIELD_TYPES } from '../config/primeng-field-config';
import { PrimeNGConfig } from '../models/primeng-config';
import { PRIMENG_CONFIG } from '../models/primeng-config.token';

/**
 * Configure dynamic forms with PrimeNG field types.
 *
 * This function provides all PrimeNG field types for use with provideDynamicForm.
 * Optionally accepts a global configuration object to set defaults for all PrimeNG fields.
 *
 * @param config - Optional global PrimeNG configuration
 * @returns Array of field type definitions
 *
 * @example
 * ```typescript
 * // Basic usage without config
 * @Component({
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields())
 *   ]
 * })
 * export class MyFormComponent {
 *   config = {
 *     fields: [
 *       { key: 'email', type: 'input', props: { type: 'email' } }
 *     ]
 *   };
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With global PrimeNG config
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields({ variant: 'filled', size: 'large' }))
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Component-level setup with comprehensive config
 * @Component({
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields({
 *       variant: 'filled',
 *       size: 'small',
 *       styleClass: 'my-custom-theme',
 *       buttonSeverity: 'success',
 *       buttonRounded: true
 *     }))
 *   ]
 * })
 * export class MyFormComponent { }
 * ```
 *
 * @public
 */
export function withPrimeNGFields(config?: PrimeNGConfig): FieldTypeDefinition[] | FieldTypeDefinitionWithConfig {
  const fields = [...PRIMENG_FIELD_TYPES] as FieldTypeDefinitionWithConfig;

  if (config) {
    fields.__configProviders = [
      {
        provide: PRIMENG_CONFIG,
        useValue: config,
      },
    ];
  }

  return fields;
}
