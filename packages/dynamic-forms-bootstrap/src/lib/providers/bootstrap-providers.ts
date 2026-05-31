import type { Provider } from '@angular/core';
import { DynamicFormError, type AddonKindDefinition } from '@ng-forge/dynamic-forms';
import { ADDON_KIND_DEFINITIONS, type FieldTypeDefinition } from '@ng-forge/dynamic-forms/integration';
import { BOOTSTRAP_FIELD_TYPES } from '../config/bootstrap-field-config';
import { BootstrapConfig } from '../models/bootstrap-config';
import { BOOTSTRAP_CONFIG } from '../models/bootstrap-config.token';
import type { BsButtonAddon, BsIconAddon } from '../types/addons';

/** Field type definitions for Bootstrap components. */
export type BootstrapFieldTypes = FieldTypeDefinition[];

type BootstrapConfigFeature = {
  ɵkind: 'bootstrap-config';
  ɵproviders: Provider[];
};

/**
 * Default `withBootstrapFields()` shape — field defs + the auto-included
 * addons feature so `bs-icon` / `bs-button` work out of the box.
 */
type BootstrapFieldsWithAddons = [...BootstrapFieldTypes, BootstrapAddonsFeature];

type BootstrapFieldsWithConfig = [...BootstrapFieldTypes, BootstrapAddonsFeature, BootstrapConfigFeature];

/**
 * Provides Bootstrap field type definitions for the dynamic form system,
 * with Bootstrap-shipped addon kinds (`bs-icon`, `bs-button`) auto-included
 * so addons work out of the box.
 *
 * @param config - Optional global configuration for Bootstrap form fields
 * @returns Tuple of field type definitions, the addons feature, and
 *   optionally a config feature.
 */
export function withBootstrapFields(): BootstrapFieldsWithAddons;
export function withBootstrapFields(config: BootstrapConfig): BootstrapFieldsWithConfig;
export function withBootstrapFields(config: BootstrapConfig | undefined): BootstrapFieldsWithAddons | BootstrapFieldsWithConfig;
export function withBootstrapFields(config?: BootstrapConfig): BootstrapFieldsWithAddons | BootstrapFieldsWithConfig {
  // Always include the addons feature — bs-icon / bs-button are part of
  // the canonical Bootstrap surface.
  const base: unknown[] = [...BOOTSTRAP_FIELD_TYPES, withBootstrapAddons()];

  if (config) {
    base.push({
      ɵkind: 'bootstrap-config',
      ɵproviders: [{ provide: BOOTSTRAP_CONFIG, useValue: config }],
    } satisfies BootstrapConfigFeature);
    return base as BootstrapFieldsWithConfig;
  }

  return base as BootstrapFieldsWithAddons;
}

/* -- Bootstrap addon kinds --------------------------------------------- */

const BS_ICON_KIND: AddonKindDefinition<BsIconAddon> = {
  kind: 'bs-icon',
  loadComponent: () => import('../addons/bs-icon-addon.component').then((m) => m.BsIconAddonComponent),
  validate: (addon, fieldKey) => {
    if (typeof addon.icon !== 'string' || addon.icon.length === 0) {
      throw new DynamicFormError(`Addon kind 'bs-icon' requires a non-empty 'icon' string (field: '${fieldKey}').`);
    }
  },
};

const BS_BUTTON_KIND: AddonKindDefinition<BsButtonAddon> = {
  kind: 'bs-button',
  loadComponent: () => import('../addons/bs-button-addon.component').then((m) => m.BsButtonAddonComponent),
  validate: (addon, fieldKey) => {
    // Exactly one of preset / actionRef / action — validator drops the addon
    // (with warning) if the rule is violated.
    const set = [addon.preset, addon.actionRef, addon.action].filter((v) => v !== undefined);
    if (set.length > 1) {
      throw new DynamicFormError(
        `Addon kind 'bs-button' on field '${fieldKey}' has more than one of preset/actionRef/action — exactly one allowed.`,
      );
    }
    // Icon-only buttons require ariaLabel for screen readers.
    if (addon.icon && !addon.label && !addon.ariaLabel) {
      throw new DynamicFormError(`Addon kind 'bs-button' on field '${fieldKey}' is icon-only — provide 'ariaLabel' for accessibility.`);
    }
  },
};

/**
 * Feature kind discriminant for the Bootstrap addons feature. Matches core's
 * `'addons'` kind so providers flow through the standard addon-kind pipeline
 * in `provideDynamicForm`.
 */
type BootstrapAddonsFeature = {
  ɵkind: 'addons';
  ɵproviders: Provider[];
};

/** Register Bootstrap-shipped addon kinds (`bs-icon`, `bs-button`) standalone. */
export function withBootstrapAddons(): BootstrapAddonsFeature {
  return {
    ɵkind: 'addons',
    ɵproviders: [
      { provide: ADDON_KIND_DEFINITIONS, useValue: BS_ICON_KIND, multi: true },
      { provide: ADDON_KIND_DEFINITIONS, useValue: BS_BUTTON_KIND, multi: true },
    ],
  };
}
