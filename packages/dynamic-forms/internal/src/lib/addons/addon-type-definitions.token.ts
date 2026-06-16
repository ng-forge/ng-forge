import { InjectionToken } from '@angular/core';
import { AddonTypeDefinition } from '../models/addon/addon-type';

/**
 * Multi-provider token used by `withCustomAddon(...)` features and UI adapters
 * to contribute addon type definitions. `provideDynamicForm` aggregates all
 * values into the form-scoped `ADDON_TYPE_REGISTRY` map.
 *
 * Part of the `/integration` adapter contract: each UI adapter registers its
 * addon kinds against this token in its provider.
 */
export const ADDON_TYPE_DEFINITIONS = new InjectionToken<readonly AddonTypeDefinition[]>('ADDON_TYPE_DEFINITIONS');
