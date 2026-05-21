import type { Provider } from '@angular/core';
import { ADDON_KIND_DEFINITIONS, DynamicFormError, type AddonKindDefinition, type FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';
import { MaterialConfig } from '../models/material-config';
import { MATERIAL_CONFIG } from '../models/material-config.token';
import type { MatButtonAddon, MatIconAddon } from '../types/addons';

/**
 * Field type definitions for Material Design components.
 */
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
 * Material-shipped addon kinds (`mat-icon`, `mat-button`) auto-included so
 * addons work out of the box.
 *
 * If you want field types WITHOUT addons (rare), pass them through
 * `provideDynamicForm` directly and skip this helper. If you want addons
 * WITHOUT the field types (also rare), call `withMaterialAddons()` standalone.
 *
 * @param config - Optional global configuration for Material form fields
 *
 * @example
 * ```typescript
 * // Application-level setup — addons (mat-icon, mat-button) ship in automatically
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-forms';
 * import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withMaterialFields())
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
 *       ...withMaterialFields({
 *         appearance: 'fill',
 *         subscriptSizing: 'fixed'
 *       })
 *     )
 *   ]
 * };
 * ```
 *
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

/* -- Material addon kinds ----------------------------------------------- */

const MAT_ICON_KIND: AddonKindDefinition<MatIconAddon> = {
  kind: 'mat-icon',
  loadComponent: () => import('../addons/mat-icon-addon.component').then((m) => m.MatIconAddonComponent),
  validate: (addon, fieldKey) => {
    if (typeof addon.icon !== 'string' || addon.icon.length === 0) {
      throw new DynamicFormError(`Addon kind 'mat-icon' requires a non-empty 'icon' string (field: '${fieldKey}').`);
    }
  },
};

const MAT_BUTTON_KIND: AddonKindDefinition<MatButtonAddon> = {
  kind: 'mat-button',
  loadComponent: () => import('../addons/mat-button-addon.component').then((m) => m.MatButtonAddonComponent),
  validate: (addon, fieldKey) => {
    // Exactly one of preset / actionRef / action — validator drops the addon
    // (with warning) if the rule is violated.
    const set = [addon.preset, addon.actionRef, addon.action].filter((v) => v !== undefined);
    if (set.length > 1) {
      throw new DynamicFormError(
        `Addon kind 'mat-button' on field '${fieldKey}' has more than one of preset/actionRef/action — exactly one allowed.`,
      );
    }
    // Icon-only buttons require ariaLabel for screen readers.
    if (addon.icon && !addon.label && !addon.ariaLabel) {
      throw new DynamicFormError(`Addon kind 'mat-button' on field '${fieldKey}' is icon-only — provide 'ariaLabel' for accessibility.`);
    }
  },
};

/**
 * Feature kind discriminant for the Material addons feature. Matches core's
 * `'addons'` kind so providers flow through the standard addon-kind pipeline
 * in `provideDynamicForm`.
 */
type MaterialAddonsFeature = {
  ɵkind: 'addons';
  ɵproviders: Provider[];
};

/**
 * Register Material-shipped addon kinds (`mat-icon`, `mat-button`) standalone.
 *
 * **Most users don't need this** — `withMaterialFields()` auto-includes
 * these kinds. Call `withMaterialAddons()` directly only when you want
 * Material addon kinds without the Material field types (e.g., a custom
 * field set that wants to render `mat-icon` prefixes), or when you're
 * stitching addons through a different DI scope.
 *
 * @example
 * ```typescript
 * // Custom field types + Material addon kinds.
 * provideDynamicForm(
 *   ...myCustomFields(),
 *   withMaterialAddons(),
 * );
 * ```
 *
 * Adapter authors who need to override a kind with a customised renderer
 * should call `withCustomAddon(...)` directly instead.
 */
export function withMaterialAddons(): MaterialAddonsFeature {
  return {
    ɵkind: 'addons',
    ɵproviders: [
      { provide: ADDON_KIND_DEFINITIONS, useValue: MAT_ICON_KIND, multi: true },
      { provide: ADDON_KIND_DEFINITIONS, useValue: MAT_BUTTON_KIND, multi: true },
    ],
  };
}
