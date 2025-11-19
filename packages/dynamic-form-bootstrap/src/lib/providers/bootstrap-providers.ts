import { FieldTypeDefinition, FieldTypeDefinitionWithConfig } from '@ng-forge/dynamic-form';
import { BOOTSTRAP_FIELD_TYPES } from '../config/bootstrap-field-config';
import { BootstrapConfig } from '../models/bootstrap-config';
import { BOOTSTRAP_CONFIG } from '../models/bootstrap-config.token';

/**
 * Configure dynamic forms with Bootstrap field types.
 *
 * This function provides all Bootstrap field types for use with provideDynamicForm.
 * Optionally accepts a global configuration object to set defaults for all Bootstrap fields.
 *
 * @param config - Optional global Bootstrap configuration
 * @returns Array of field type definitions
 *
 * @example
 * ```typescript
 * // Basic usage without config
 * @Component({
 *   providers: [provideDynamicForm(...withBootstrapFields())],
 * })
 * export class MyFormComponent {
 *   config: DynamicFormConfig = {
 *     fields: [
 *       {
 *         key: 'email',
 *         type: 'input',
 *         label: 'Email',
 *         props: { type: 'email', size: 'lg' }
 *       }
 *     ]
 *   };
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With global Bootstrap config
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withBootstrapFields({ size: 'lg', floatingLabel: true }))
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Component-level setup with comprehensive config
 * @Component({
 *   providers: [
 *     provideDynamicForm(...withBootstrapFields({
 *       size: 'lg',
 *       floatingLabel: true,
 *       switchStyle: true,
 *       buttonVariant: 'primary'
 *     }))
 *   ]
 * })
 * export class MyFormComponent { }
 * ```
 *
 * @public
 */
export function withBootstrapFields(config?: BootstrapConfig): FieldTypeDefinition[] | FieldTypeDefinitionWithConfig {
  const fields = [...BOOTSTRAP_FIELD_TYPES] as FieldTypeDefinitionWithConfig;

  if (config) {
    fields.__configProviders = [
      {
        provide: BOOTSTRAP_CONFIG,
        useValue: config,
      },
    ];
  }

  return fields;
}
