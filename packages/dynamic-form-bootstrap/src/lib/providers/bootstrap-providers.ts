import { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import type { Provider } from '@angular/core';
import { BOOTSTRAP_FIELD_TYPES } from '../config/bootstrap-field-config';
import { BootstrapConfig } from '../models/bootstrap-config';
import { BOOTSTRAP_CONFIG } from '../models/bootstrap-config.token';

/**
 * Provides Bootstrap field types for the dynamic form system.
 * Use with provideDynamicForm(...withBootstrapFields())
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
 * @returns Array of field type definitions for Bootstrap components
 */
export function withBootstrapFields(): FieldTypeDefinition[] {
  return BOOTSTRAP_FIELD_TYPES;
}

/**
 * Configure global defaults for Bootstrap fields.
 *
 * This function provides global configuration that applies to all Bootstrap fields
 * in the form. Field-level props will override these global defaults.
 *
 * @param config - Global Bootstrap configuration
 * @returns Array of Angular providers
 *
 * @example
 * ```typescript
 * // Application-level setup with global Bootstrap config
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withBootstrapFields()),
 *     ...withBootstrapConfig({ size: 'lg', floatingLabel: true })
 *   ]
 * });
 * ```
 *
 * @public
 */
export function withBootstrapConfig(config: BootstrapConfig): Provider[] {
  return [
    {
      provide: BOOTSTRAP_CONFIG,
      useValue: config,
    },
  ];
}
