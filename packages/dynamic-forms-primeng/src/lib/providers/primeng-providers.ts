import type { Provider } from '@angular/core';
import { DynamicFormError, type AddonTypeDefinition } from '@ng-forge/dynamic-forms';
import { ADDON_TYPE_DEFINITIONS, type FieldTypeDefinition } from '@ng-forge/dynamic-forms/integration';
import { PRIMENG_FIELD_TYPES } from '../config/primeng-field-config';
import { PrimeNGConfig } from '../models/primeng-config';
import { PRIMENG_CONFIG } from '../models/primeng-config.token';
import type { PrimeButtonAddon, PrimeIconAddon } from '../types/addons';

/** Field type definitions for PrimeNG components. */
export type PrimeNGFieldTypes = FieldTypeDefinition[];

type PrimeNGConfigFeature = {
  ɵkind: 'primeng-config';
  ɵproviders: Provider[];
};

/**
 * Default `withPrimeNGFields()` shape — field defs + the auto-included
 * addons feature so `prime-icon` / `prime-button` work out of the box.
 */
type PrimeNGFieldsWithAddons = [...PrimeNGFieldTypes, PrimeNGAddonsFeature];

type PrimeNGFieldsWithConfig = [...PrimeNGFieldTypes, PrimeNGAddonsFeature, PrimeNGConfigFeature];

/**
 * Provides PrimeNG field type definitions for the dynamic form system,
 * with PrimeNG-shipped addon types (`prime-icon`, `prime-button`) auto-included
 * so addons work out of the box.
 *
 * @param config - Optional global configuration for PrimeNG form fields
 * @returns Tuple of field type definitions, the addons feature, and
 *   optionally a config feature.
 */
export function withPrimeNGFields(): PrimeNGFieldsWithAddons;
export function withPrimeNGFields(config: PrimeNGConfig): PrimeNGFieldsWithConfig;
export function withPrimeNGFields(config: PrimeNGConfig | undefined): PrimeNGFieldsWithAddons | PrimeNGFieldsWithConfig;
export function withPrimeNGFields(config?: PrimeNGConfig): PrimeNGFieldsWithAddons | PrimeNGFieldsWithConfig {
  // Always include the addons feature — prime-icon / prime-button are part of
  // the canonical PrimeNG surface.
  const base: unknown[] = [...PRIMENG_FIELD_TYPES, withPrimeNGAddons()];

  if (config) {
    base.push({
      ɵkind: 'primeng-config',
      ɵproviders: [{ provide: PRIMENG_CONFIG, useValue: config }],
    } satisfies PrimeNGConfigFeature);
    return base as PrimeNGFieldsWithConfig;
  }

  return base as PrimeNGFieldsWithAddons;
}

/* -- PrimeNG addon types ----------------------------------------------- */

const PI_ICON_KIND: AddonTypeDefinition<PrimeIconAddon> = {
  type: 'prime-icon',
  loadComponent: () => import('../addons/prime-icon-addon.component').then((m) => m.PrimeIconAddonComponent),
  validate: (addon, fieldKey) => {
    if (typeof addon.icon !== 'string' || addon.icon.length === 0) {
      throw new DynamicFormError(`Addon type 'prime-icon' requires a non-empty 'icon' string (field: '${fieldKey}').`);
    }
  },
};

const PI_BUTTON_KIND: AddonTypeDefinition<PrimeButtonAddon> = {
  type: 'prime-button',
  loadComponent: () => import('../addons/prime-button-addon.component').then((m) => m.PrimeButtonAddonComponent),
  validate: (addon, fieldKey) => {
    // Exactly one of preset / actionRef / action — validator drops the addon
    // (with warning) if the rule is violated.
    const set = [addon.preset, addon.actionRef, addon.action].filter((v) => v !== undefined);
    if (set.length > 1) {
      throw new DynamicFormError(
        `Addon type 'prime-button' on field '${fieldKey}' has more than one of preset/actionRef/action — exactly one allowed.`,
      );
    }
    // Icon-only buttons require ariaLabel for screen readers.
    if (addon.icon && !addon.label && !addon.ariaLabel) {
      throw new DynamicFormError(`Addon type 'prime-button' on field '${fieldKey}' is icon-only — provide 'ariaLabel' for accessibility.`);
    }
  },
};

/**
 * Feature type discriminant for the PrimeNG addons feature. Matches core's
 * `'addons'` type so providers flow through the standard addon-type pipeline
 * in `provideDynamicForm`.
 */
type PrimeNGAddonsFeature = {
  ɵkind: 'addons';
  ɵproviders: Provider[];
};

/** Register PrimeNG-shipped addon types (`prime-icon`, `prime-button`) standalone. */
export function withPrimeNGAddons(): PrimeNGAddonsFeature {
  return {
    ɵkind: 'addons',
    ɵproviders: [
      { provide: ADDON_TYPE_DEFINITIONS, useValue: PI_ICON_KIND, multi: true },
      { provide: ADDON_TYPE_DEFINITIONS, useValue: PI_BUTTON_KIND, multi: true },
    ],
  };
}
