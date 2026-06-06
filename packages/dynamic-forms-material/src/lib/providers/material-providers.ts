import type { Provider } from '@angular/core';
import { DynamicFormError, type AddonTypeDefinition } from '@ng-forge/dynamic-forms';
import { ADDON_TYPE_DEFINITIONS, type FieldTypeDefinition } from '@ng-forge/dynamic-forms/integration';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';
import { MaterialConfig } from '../models/material-config';
import { MATERIAL_CONFIG } from '../models/material-config.token';
import type { MatButtonAddon, MatIconAddon } from '../types/addons';

/** Field type definitions for Material Design components. */
export type MaterialFieldTypes = FieldTypeDefinition[];

type MaterialConfigFeature = {
  ɵkind: 'material-config';
  ɵproviders: Provider[];
};

/**
 * Default `withMaterialFields()` shape — field defs + the auto-included
 * addons feature so `mat-icon` / `mat-button` work out of the box.
 */
type MaterialFieldsWithAddons = [...MaterialFieldTypes, MaterialAddonsFeature];

type MaterialFieldsWithConfig = [...MaterialFieldTypes, MaterialAddonsFeature, MaterialConfigFeature];

/**
 * Configure dynamic forms with Material Design field types, with
 * Material-shipped addon types (`mat-icon`, `mat-button`) auto-included so
 * addons work out of the box.
 *
 * @param config - Optional global configuration for Material form fields
 * @returns Tuple of field type definitions, the addons feature, and
 *   optionally a config feature.
 */
export function withMaterialFields(): MaterialFieldsWithAddons;
export function withMaterialFields(config: MaterialConfig): MaterialFieldsWithConfig;
export function withMaterialFields(config: MaterialConfig | undefined): MaterialFieldsWithAddons | MaterialFieldsWithConfig;
export function withMaterialFields(config?: MaterialConfig): MaterialFieldsWithAddons | MaterialFieldsWithConfig {
  // Always include the addons feature — mat-icon / mat-button are part of
  // the canonical Material surface.
  const base: unknown[] = [...MATERIAL_FIELD_TYPES, withMaterialAddons()];

  if (config) {
    base.push({
      ɵkind: 'material-config',
      ɵproviders: [{ provide: MATERIAL_CONFIG, useValue: config }],
    } satisfies MaterialConfigFeature);
    return base as MaterialFieldsWithConfig;
  }

  return base as MaterialFieldsWithAddons;
}

/* -- Material addon types ----------------------------------------------- */

const MAT_ICON_KIND: AddonTypeDefinition<MatIconAddon> = {
  type: 'mat-icon',
  loadComponent: () => import('../addons/mat-icon-addon.component').then((m) => m.MatIconAddonComponent),
  validate: (addon, fieldKey) => {
    if (typeof addon.icon !== 'string' || addon.icon.length === 0) {
      throw new DynamicFormError(`Addon type 'mat-icon' requires a non-empty 'icon' string (field: '${fieldKey}').`);
    }
  },
};

const MAT_BUTTON_KIND: AddonTypeDefinition<MatButtonAddon> = {
  type: 'mat-button',
  loadComponent: () => import('../addons/mat-button-addon.component').then((m) => m.MatButtonAddonComponent),
  validate: (addon, fieldKey) => {
    // Exactly one of preset / actionRef / action — validator drops the addon
    // (with warning) if the rule is violated.
    const set = [addon.preset, addon.actionRef, addon.action].filter((v) => v !== undefined);
    if (set.length > 1) {
      throw new DynamicFormError(
        `Addon type 'mat-button' on field '${fieldKey}' has more than one of preset/actionRef/action — exactly one allowed.`,
      );
    }
    // Icon-only buttons require ariaLabel for screen readers.
    if (addon.icon && !addon.label && !addon.ariaLabel) {
      throw new DynamicFormError(`Addon type 'mat-button' on field '${fieldKey}' is icon-only — provide 'ariaLabel' for accessibility.`);
    }
  },
};

/**
 * Feature type discriminant for the Material addons feature. Matches core's
 * `'addons'` type so providers flow through the standard addon-type pipeline
 * in `provideDynamicForm`.
 */
type MaterialAddonsFeature = {
  ɵkind: 'addons';
  ɵproviders: Provider[];
};

/** Register Material-shipped addon types (`mat-icon`, `mat-button`) standalone. */
export function withMaterialAddons(): MaterialAddonsFeature {
  return {
    ɵkind: 'addons',
    ɵproviders: [
      { provide: ADDON_TYPE_DEFINITIONS, useValue: MAT_ICON_KIND, multi: true },
      { provide: ADDON_TYPE_DEFINITIONS, useValue: MAT_BUTTON_KIND, multi: true },
    ],
  };
}
