import { InjectionToken, Signal, TemplateRef } from '@angular/core';

/**
 * Map of named `TemplateRef`s collected by `<df-dynamic-form>` from
 * `<ng-template dfTemplate="...">` children projected into its content.
 * The directive selector is `dfTemplate` (see `DfTemplate`); the input
 * value is the name addons reference via `templateKey`.
 *
 * The `template` addon kind looks up its `templateKey` in this map at
 * render time. Exposed as a `Signal` so projections can be added or
 * removed reactively (e.g., when the host conditionally projects).
 *
 * Provided at the form-component level (not root) so multiple
 * `<df-dynamic-form>` instances on the same page have independent
 * template scopes.
 */
export const DF_FIELD_TEMPLATES = new InjectionToken<Signal<ReadonlyMap<string, TemplateRef<unknown>>>>('DF_FIELD_TEMPLATES');
