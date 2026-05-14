import type { Provider } from '@angular/core';
import { ADDON_KIND_DEFINITIONS, DynamicFormError, type AddonKindDefinition, type FieldTypeDefinition } from '@ng-forge/dynamic-forms';
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

/**
 * Default `withPrimeNGFields()` shape — field defs + the auto-included
 * addons feature so `pi-icon` / `pi-button` work out of the box.
 */
type PrimeNGFieldsWithAddons = [...PrimeNGFieldTypes, PrimeNGAddonsFeature];

type PrimeNGFieldsWithConfig = [...PrimeNGFieldTypes, PrimeNGAddonsFeature, PrimeNGConfigFeature];

/**
 * Provides PrimeNG field type definitions for the dynamic form system,
 * with PrimeNG-shipped addon kinds (`pi-icon`, `pi-button`) auto-included
 * so addons work out of the box.
 *
 * If you want field types WITHOUT addons (rare), pass them through
 * `provideDynamicForm` directly and skip this helper. If you want addons
 * WITHOUT the field types (also rare — e.g., adding addons to a form that
 * uses custom fields), call `withPrimeNGAddons()` standalone.
 *
 * @param config - Optional global configuration for PrimeNG form fields
 *
 * @example
 * ```typescript
 * // Application-level setup — addons (pi-icon, pi-button) ship in automatically
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-forms';
 * import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';
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
 * @returns Tuple of field type definitions, the addons feature, and
 *   optionally a config feature.
 */
export function withPrimeNGFields(): PrimeNGFieldsWithAddons;
export function withPrimeNGFields(config: PrimeNGConfig): PrimeNGFieldsWithConfig;
export function withPrimeNGFields(config: PrimeNGConfig | undefined): PrimeNGFieldsWithAddons | PrimeNGFieldsWithConfig;
export function withPrimeNGFields(config?: PrimeNGConfig): PrimeNGFieldsWithAddons | PrimeNGFieldsWithConfig {
  // Always include the addons feature — pi-icon / pi-button are part of
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

/* -- PrimeNG addon kinds ----------------------------------------------- */

const PI_ICON_KIND: AddonKindDefinition<PiIconAddon> = {
  kind: 'pi-icon',
  loadComponent: () => import('../addons/pi-icon-addon.component').then((m) => m.PiIconAddonComponent),
  validate: (addon, fieldKey) => {
    if (typeof addon.icon !== 'string' || addon.icon.length === 0) {
      throw new DynamicFormError(`Addon kind 'pi-icon' requires a non-empty 'icon' string (field: '${fieldKey}').`);
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
      throw new DynamicFormError(
        `Addon kind 'pi-button' on field '${fieldKey}' has more than one of preset/actionRef/action — exactly one allowed.`,
      );
    }
    // Icon-only buttons require ariaLabel for screen readers.
    if (addon.icon && !addon.label && !addon.ariaLabel) {
      throw new DynamicFormError(`Addon kind 'pi-button' on field '${fieldKey}' is icon-only — provide 'ariaLabel' for accessibility.`);
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
 * Register PrimeNG-shipped addon kinds (`pi-icon`, `pi-button`) standalone.
 *
 * **Most users don't need this** — `withPrimeNGFields()` auto-includes
 * these kinds. Call `withPrimeNGAddons()` directly only when you want
 * PrimeNG addon kinds without the PrimeNG field types (e.g., a custom
 * field set that wants to render `pi-icon` prefixes), or when you're
 * stitching addons through a different DI scope.
 *
 * @example
 * ```typescript
 * // Custom field types + PrimeNG addon kinds.
 * provideDynamicForm(
 *   ...myCustomFields(),
 *   withPrimeNGAddons(),
 * );
 * ```
 *
 * Adapter authors who need to override a kind with a customised renderer
 * should call `withCustomAddon(...)` directly instead.
 */
export function withPrimeNGAddons(): PrimeNGAddonsFeature {
  return {
    ɵkind: 'addons',
    ɵproviders: [
      { provide: ADDON_KIND_DEFINITIONS, useValue: PI_ICON_KIND, multi: true },
      { provide: ADDON_KIND_DEFINITIONS, useValue: PI_BUTTON_KIND, multi: true },
    ],
  };
}
