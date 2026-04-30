import { AddonKindDefinition } from '../../../models/addon/addon-kind';
import { BaseAddon } from '../../../models/addon/addon-def';
import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { ADDON_KIND_DEFINITIONS } from './addon-kind-definitions.token';

/**
 * Register a custom addon kind with the form.
 *
 * The provided definition is added to `ADDON_KIND_REGISTRY` at form
 * initialisation, alongside the built-in `text` / `template` / `component`
 * kinds and any kinds contributed by adapter feature helpers
 * (`withPrimeNGAddons()` etc.).
 *
 * @example
 * ```typescript
 * provideDynamicForm(
 *   ...withMaterialFields(),
 *   withCustomAddon({
 *     kind: 'lucide-icon',
 *     // Match how field types register: a default-exported component lets
 *     // `loadComponent` return the import promise directly.
 *     loadComponent: () => import('./lucide-icon-addon.component'),
 *     validate: (addon) => {
 *       if (typeof addon.icon !== 'string') {
 *         throw new Error('lucide-icon: icon string is required');
 *       }
 *     },
 *   }),
 * );
 * ```
 *
 * Multiple `withCustomAddon(...)` calls are supported; later registrations
 * for the same kind override earlier ones (with a warning logged).
 */
export function withCustomAddon<T extends BaseAddon>(definition: AddonKindDefinition<T>): DynamicFormFeature<'addons'> {
  return createFeature('addons', [
    {
      provide: ADDON_KIND_DEFINITIONS,
      useValue: definition as AddonKindDefinition,
      multi: true,
    },
  ]);
}
