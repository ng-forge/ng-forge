import { InjectionToken } from '@angular/core';
import { AddonKindDefinition } from '@ng-forge/dynamic-forms/internal';

/**
 * Multi-provider token used by `withCustomAddon(...)` features to contribute
 * addon kind definitions. `provideDynamicForm` aggregates all values into
 * the form-scoped `ADDON_KIND_REGISTRY` map.
 *
 * @internal
 */
export const ADDON_KIND_DEFINITIONS = new InjectionToken<readonly AddonKindDefinition[]>('ADDON_KIND_DEFINITIONS');
