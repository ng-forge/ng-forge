import type { Provider } from '@angular/core';
import { ADDON_KIND_DEFINITIONS, type AddonKindDefinition, type FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { PRIMENG_FIELD_TYPES } from '../config/primeng-field-config';
import { PrimeNGConfig } from '../models/primeng-config';
import { PRIMENG_CONFIG } from '../models/primeng-config.token';
import type { PiButtonAddon, PiIconAddon } from '../types/addons';

/**
 * Field type definitions for PrimeNG components.
 */
export type PrimeNGFieldTypes = FieldTypeDefinition[];

type PrimeNGConfigFeature = {
  ɵkind: 'primeng-config';
  ɵproviders: Provider[];
};

type PrimeNGFieldsWithConfig = [...PrimeNGFieldTypes, PrimeNGConfigFeature];

/**
 * Provides PrimeNG field type definitions for the dynamic form system.
 *
 * Use this function in your application providers to register PrimeNG field components.
 *
 * @param config - Optional global configuration for PrimeNG form fields
 *
 * @example
 * ```typescript
 * // Application-level setup
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-form';
 * import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields())
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
 *       ...withPrimeNGFields({
 *         variant: 'filled',
 *         size: 'large'
 *       })
 *     )
 *   ]
 * };
 * ```
 *
 * @returns Array of field type definitions and optionally a config feature
 */
export function withPrimeNGFields(): PrimeNGFieldTypes;
export function withPrimeNGFields(config: PrimeNGConfig): PrimeNGFieldsWithConfig;
export function withPrimeNGFields(config: PrimeNGConfig | undefined): PrimeNGFieldTypes | PrimeNGFieldsWithConfig;
export function withPrimeNGFields(config?: PrimeNGConfig): PrimeNGFieldTypes | PrimeNGFieldsWithConfig {
  if (!config) {
    return PRIMENG_FIELD_TYPES;
  }

  const fieldsWithConfig = [
    ...PRIMENG_FIELD_TYPES,
    {
      ɵkind: 'primeng-config',
      ɵproviders: [{ provide: PRIMENG_CONFIG, useValue: config }],
    } satisfies PrimeNGConfigFeature,
  ];

  // Safe: this preserves all PrimeNG field definitions and appends exactly one config feature.
  return fieldsWithConfig as PrimeNGFieldsWithConfig;
}

/* -- PrimeNG addon kinds ----------------------------------------------- */

const PI_ICON_KIND: AddonKindDefinition<PiIconAddon> = {
  kind: 'pi-icon',
  loadComponent: () => import('../addons/pi-icon-addon.component').then((m) => m.PiIconAddonComponent),
  validate: (addon, fieldKey) => {
    if (typeof addon.icon !== 'string' || addon.icon.length === 0) {
      throw new Error(`Addon kind 'pi-icon' requires a non-empty 'icon' string (field: '${fieldKey}').`);
    }
  },
};

const PI_BUTTON_KIND: AddonKindDefinition<PiButtonAddon> = {
  kind: 'pi-button',
  loadComponent: () => import('../addons/pi-button-addon.component').then((m) => m.PiButtonAddonComponent),
  validate: (addon, fieldKey) => {
    // Exactly one of preset / actionRef / action — validator drops the addon
    // (with warning) if the rule is violated.
    const set = [addon.preset, addon.actionRef, addon.action].filter((v) => v !== undefined);
    if (set.length > 1) {
      throw new Error(`Addon kind 'pi-button' on field '${fieldKey}' has more than one of preset/actionRef/action — exactly one allowed.`);
    }
    // Icon-only buttons require ariaLabel for screen readers.
    if (addon.icon && !addon.label && !addon.ariaLabel) {
      throw new Error(`Addon kind 'pi-button' on field '${fieldKey}' is icon-only — provide 'ariaLabel' for accessibility.`);
    }
  },
};

/**
 * Feature kind discriminant for the PrimeNG addons feature. Matches core's
 * `'addons'` kind so providers flow through the standard addon-kind pipeline
 * in `provideDynamicForm`.
 */
type PrimeNGAddonsFeature = {
  ɵkind: 'addons';
  ɵproviders: Provider[];
};

/**
 * Register PrimeNG-shipped addon kinds (`pi-icon`, `pi-button`).
 *
 * Compose alongside `withPrimeNGFields(...)` in `provideDynamicForm` to get
 * both kinds available to all PrimeNG fields that declare addon support.
 *
 * @example
 * ```typescript
 * provideDynamicForm(
 *   ...withPrimeNGFields(),
 *   withPrimengAddons(),
 * );
 * ```
 *
 * Adapter authors who need only a subset, or want to override a kind with a
 * customised renderer, should call `withCustomAddon(...)` directly instead.
 */
export function withPrimengAddons(): PrimeNGAddonsFeature {
  return {
    ɵkind: 'addons',
    ɵproviders: [
      { provide: ADDON_KIND_DEFINITIONS, useValue: PI_ICON_KIND, multi: true },
      { provide: ADDON_KIND_DEFINITIONS, useValue: PI_BUTTON_KIND, multi: true },
    ],
  };
}
