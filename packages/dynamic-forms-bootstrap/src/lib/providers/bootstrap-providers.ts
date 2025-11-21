import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import type { Provider } from '@angular/core';
import { BOOTSTRAP_FIELD_TYPES } from '../config/bootstrap-field-config';
import { BootstrapConfig } from '../models/bootstrap-config';
import { BOOTSTRAP_CONFIG } from '../models/bootstrap-config.token';

/**
 * Field type definitions with optional config providers
 */
export type FieldTypeDefinitionsWithConfig = FieldTypeDefinition[] & {
  __configProviders?: Provider[];
};

/**
 * Provides Bootstrap field types for the dynamic form system.
 * Use with provideDynamicForm(...withBootstrapFields())
 *
 * @param config - Optional global configuration for Bootstrap form fields
 *
 * @example
 * ```typescript
 * // Application-level setup
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-form';
 * import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withBootstrapFields())
 *   ]
 * };
 * ```
 *
 * @example
 * ```typescript
 * // With global configuration
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(
 *       ...withBootstrapFields({
 *         floatingLabel: true,
 *         size: 'lg'
 *       })
 *     )
 *   ]
 * };
 * ```
 *
 * @returns Array of field type definitions for Bootstrap components
 */
export function withBootstrapFields(config?: BootstrapConfig): FieldTypeDefinitionsWithConfig {
  const fields = BOOTSTRAP_FIELD_TYPES as FieldTypeDefinitionsWithConfig;

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
