import type { Provider } from '@angular/core';
import type { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { IONIC_FIELD_TYPES } from '../config/ionic-field-config';
import { IonicConfig } from '../models/ionic-config';
import { IONIC_CONFIG } from '../models/ionic-config.token';

/**
 * Field type definitions for Ionic components.
 */
export type IonicFieldTypes = FieldTypeDefinition[];

type IonicConfigFeature = {
  ɵkind: 'ionic-config';
  ɵproviders: Provider[];
};

type IonicFieldsWithConfig = [...IonicFieldTypes, IonicConfigFeature];

/**
 * Configure dynamic forms with Ionic field types.
 * Provides all Ionic field types for use with provideDynamicForm.
 *
 * @param config - Optional global configuration for Ionic form fields
 *
 * @example
 * ```typescript
 * // Application-level setup
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-form';
 * import { withIonicFields } from '@ng-forge/dynamic-form-ionic';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withIonicFields())
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
 *       ...withIonicFields({
 *         fill: 'outline',
 *         labelPlacement: 'floating'
 *       })
 *     )
 *   ]
 * };
 * ```
 *
 * @returns Array of field type definitions and optionally a config feature
 */
export function withIonicFields(): IonicFieldTypes;
export function withIonicFields(config: IonicConfig): IonicFieldsWithConfig;
export function withIonicFields(config: IonicConfig | undefined): IonicFieldTypes | IonicFieldsWithConfig;
export function withIonicFields(config?: IonicConfig): IonicFieldTypes | IonicFieldsWithConfig {
  if (!config) {
    return IONIC_FIELD_TYPES;
  }

  const fieldsWithConfig = [
    ...IONIC_FIELD_TYPES,
    {
      ɵkind: 'ionic-config',
      ɵproviders: [{ provide: IONIC_CONFIG, useValue: config }],
    } satisfies IonicConfigFeature,
  ];

  // Safe: this preserves all Ionic field definitions and appends exactly one config feature.
  return fieldsWithConfig as IonicFieldsWithConfig;
}
