import type { Provider } from '@angular/core';
import { ADDON_KIND_DEFINITIONS, DynamicFormError, type AddonKindDefinition, type FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { IONIC_FIELD_TYPES } from '../config/ionic-field-config';
import { IonicConfig } from '../models/ionic-config';
import { IONIC_CONFIG } from '../models/ionic-config.token';
import type { IonButtonAddon, IonIconAddon } from '../types/addons';

/**
 * Field type definitions for Ionic components.
 */
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
 * If you want field types WITHOUT addons (rare), pass them through
 * `provideDynamicForm` directly and skip this helper. If you want addons
 * WITHOUT the field types (also rare — e.g., adding addons to a form that
 * uses custom fields), call `withIonicAddons()` standalone.
 *
 * @param config - Optional global configuration for Ionic form fields
 *
 * @example
 * ```typescript
 * // Application-level setup — addons (ion-icon, ion-button) ship in automatically
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-forms';
 * import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
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

/**
 * Register Ionic-shipped addon kinds (`ion-icon`, `ion-button`) standalone.
 *
 * **Most users don't need this** — `withIonicFields()` auto-includes
 * these kinds. Call `withIonicAddons()` directly only when you want
 * Ionic addon kinds without the Ionic field types (e.g., a custom
 * field set that wants to render `ion-icon` prefixes), or when you're
 * stitching addons through a different DI scope.
 *
 * @example
 * ```typescript
 * // Custom field types + Ionic addon kinds.
 * provideDynamicForm(
 *   ...myCustomFields(),
 *   withIonicAddons(),
 * );
 * ```
 *
 * Adapter authors who need to override a kind with a customised renderer
 * should call `withCustomAddon(...)` directly instead.
 */
export function withIonicAddons(): IonicAddonsFeature {
  return {
    ɵkind: 'addons',
    ɵproviders: [
      { provide: ADDON_KIND_DEFINITIONS, useValue: ION_ICON_KIND, multi: true },
      { provide: ADDON_KIND_DEFINITIONS, useValue: ION_BUTTON_KIND, multi: true },
    ],
  };
}
