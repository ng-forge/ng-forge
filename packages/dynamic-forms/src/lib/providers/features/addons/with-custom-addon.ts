import { AddonTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { BaseAddon } from '@ng-forge/dynamic-forms/internal';
import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { ADDON_TYPE_DEFINITIONS } from './addon-type-definitions.token';

/** Register a custom addon type with the form. */
export function withCustomAddon<T extends BaseAddon>(definition: AddonTypeDefinition<T>): DynamicFormFeature<'addons'> {
  return createFeature('addons', [
    {
      provide: ADDON_TYPE_DEFINITIONS,
      useValue: definition as AddonTypeDefinition,
      multi: true,
    },
  ]);
}
