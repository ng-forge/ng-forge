import type { Provider } from '@angular/core';
import { DynamicFormError, type AddonKindDefinition } from '@ng-forge/dynamic-forms';
import { ADDON_KIND_DEFINITIONS, type FieldTypeDefinition } from '@ng-forge/dynamic-forms/integration';
import { IONIC_FIELD_TYPES } from '../config/ionic-field-config';
import { IonicConfig } from '../models/ionic-config';
import { IONIC_CONFIG } from '../models/ionic-config.token';
import type { IonButtonAddon, IonIconAddon } from '../types/addons';

/** Field type definitions for Ionic components. */
export type IonicFieldTypes = FieldTypeDefinition[];

type IonicConfigFeature = {
  ɵkind: 'ionic-config';
  ɵproviders: Provider[];
};

/**
 * Default `withIonicFields()` shape — field defs + the auto-included
 * addons feature so `ion-icon` / `ion-button` work out of the box.
 */
type IonicFieldsWithAddons = [...IonicFieldTypes, IonicAddonsFeature];

type IonicFieldsWithConfig = [...IonicFieldTypes, IonicAddonsFeature, IonicConfigFeature];

/**
 * Provides Ionic field type definitions for the dynamic form system,
 * with Ionic-shipped addon kinds (`ion-icon`, `ion-button`) auto-included
 * so addons work out of the box.
 *
 * @param config - Optional global configuration for Ionic form fields
 * @returns Tuple of field type definitions, the addons feature, and
 *   optionally a config feature.
 */
export function withIonicFields(): IonicFieldsWithAddons;
export function withIonicFields(config: IonicConfig): IonicFieldsWithConfig;
export function withIonicFields(config: IonicConfig | undefined): IonicFieldsWithAddons | IonicFieldsWithConfig;
export function withIonicFields(config?: IonicConfig): IonicFieldsWithAddons | IonicFieldsWithConfig {
  // Always include the addons feature — ion-icon / ion-button are part of
  // the canonical Ionic surface.
  const base: unknown[] = [...IONIC_FIELD_TYPES, withIonicAddons()];

  if (config) {
    base.push({
      ɵkind: 'ionic-config',
      ɵproviders: [{ provide: IONIC_CONFIG, useValue: config }],
    } satisfies IonicConfigFeature);
    return base as IonicFieldsWithConfig;
  }

  return base as IonicFieldsWithAddons;
}

/* -- Ionic addon kinds ------------------------------------------------- */

const ION_ICON_KIND: AddonKindDefinition<IonIconAddon> = {
  kind: 'ion-icon',
  loadComponent: () => import('../addons/ion-icon-addon.component').then((m) => m.IonIconAddonComponent),
  validate: (addon, fieldKey) => {
    if (typeof addon.icon !== 'string' || addon.icon.length === 0) {
      throw new DynamicFormError(`Addon kind 'ion-icon' requires a non-empty 'icon' string (field: '${fieldKey}').`);
    }
  },
};

const ION_BUTTON_KIND: AddonKindDefinition<IonButtonAddon> = {
  kind: 'ion-button',
  loadComponent: () => import('../addons/ion-button-addon.component').then((m) => m.IonButtonAddonComponent),
  validate: (addon, fieldKey) => {
    // Exactly one of preset / actionRef / action — validator drops the addon
    // (with warning) if the rule is violated.
    const set = [addon.preset, addon.actionRef, addon.action].filter((v) => v !== undefined);
    if (set.length > 1) {
      throw new DynamicFormError(
        `Addon kind 'ion-button' on field '${fieldKey}' has more than one of preset/actionRef/action — exactly one allowed.`,
      );
    }
    // Icon-only buttons require ariaLabel for screen readers.
    if (addon.icon && !addon.label && !addon.ariaLabel) {
      throw new DynamicFormError(`Addon kind 'ion-button' on field '${fieldKey}' is icon-only — provide 'ariaLabel' for accessibility.`);
    }
  },
};

/**
 * Feature kind discriminant for the Ionic addons feature. Matches core's
 * `'addons'` kind so providers flow through the standard addon-kind pipeline
 * in `provideDynamicForm`.
 */
type IonicAddonsFeature = {
  ɵkind: 'addons';
  ɵproviders: Provider[];
};

/** Register Ionic-shipped addon kinds (`ion-icon`, `ion-button`) standalone. */
export function withIonicAddons(): IonicAddonsFeature {
  return {
    ɵkind: 'addons',
    ɵproviders: [
      { provide: ADDON_KIND_DEFINITIONS, useValue: ION_ICON_KIND, multi: true },
      { provide: ADDON_KIND_DEFINITIONS, useValue: ION_BUTTON_KIND, multi: true },
    ],
  };
}
