import { AddonKindDefinition } from '@ng-forge/dynamic-forms/internal';
import { BaseAddon } from '@ng-forge/dynamic-forms/internal';
import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { ADDON_KIND_DEFINITIONS } from './addon-kind-definitions.token';

/** Register a custom addon kind with the form. */
export function withCustomAddon<T extends BaseAddon>(definition: AddonKindDefinition<T>): DynamicFormFeature<'addons'> {
  return createFeature('addons', [
    {
      provide: ADDON_KIND_DEFINITIONS,
      useValue: definition as AddonKindDefinition,
      multi: true,
    },
  ]);
}
