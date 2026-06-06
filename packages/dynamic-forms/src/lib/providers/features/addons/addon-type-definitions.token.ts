import { InjectionToken } from '@angular/core';
import { AddonTypeDefinition } from '@ng-forge/dynamic-forms/internal';

/**
 * Multi-provider token used by `withCustomAddon(...)` features to contribute
 * addon type definitions. `provideDynamicForm` aggregates all values into
 * the form-scoped `ADDON_TYPE_REGISTRY` map.
 *
 * @internal
 */
export const ADDON_TYPE_DEFINITIONS = new InjectionToken<readonly AddonTypeDefinition[]>('ADDON_TYPE_DEFINITIONS');
