import type { Provider } from '@angular/core';
import type { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { BOOTSTRAP_FIELD_TYPES } from '../config/bootstrap-field-config';
import { BootstrapConfig } from '../models/bootstrap-config';
import { BOOTSTRAP_CONFIG } from '../models/bootstrap-config.token';

/**
 * Field type definitions for Bootstrap components.
 */
export type BootstrapFieldTypes = FieldTypeDefinition[];

type BootstrapConfigFeature = {
  ɵkind: 'bootstrap-config';
  ɵproviders: Provider[];
};

type BootstrapFieldsWithConfig = [...BootstrapFieldTypes, BootstrapConfigFeature];

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
 * @returns Array of field type definitions and optionally a config feature
 */
export function withBootstrapFields(): BootstrapFieldTypes;
export function withBootstrapFields(config: BootstrapConfig): BootstrapFieldsWithConfig;
export function withBootstrapFields(config: BootstrapConfig | undefined): BootstrapFieldTypes | BootstrapFieldsWithConfig;
export function withBootstrapFields(config?: BootstrapConfig): BootstrapFieldTypes | BootstrapFieldsWithConfig {
  if (!config) {
    return BOOTSTRAP_FIELD_TYPES;
  }

  const fieldsWithConfig = [
    ...BOOTSTRAP_FIELD_TYPES,
    {
      ɵkind: 'bootstrap-config',
      ɵproviders: [{ provide: BOOTSTRAP_CONFIG, useValue: config }],
    } satisfies BootstrapConfigFeature,
  ];

  // Safe: this preserves all bootstrap field definitions and appends exactly one config feature.
  return fieldsWithConfig as BootstrapFieldsWithConfig;
}
