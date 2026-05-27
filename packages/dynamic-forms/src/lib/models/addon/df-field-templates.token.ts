import { InjectionToken, Signal, TemplateRef } from '@angular/core';

/**
 * Map of named `TemplateRef`s collected by `<df-dynamic-form>` from
 * `<ng-template dfTemplate="...">` children projected into its content.
 * The directive selector is `dfTemplate` (see `DfTemplate`); the input
 * value is the name addons reference via `templateKey`.
 */
export const DF_FIELD_TEMPLATES = new InjectionToken<Signal<ReadonlyMap<string, TemplateRef<unknown>>>>('DF_FIELD_TEMPLATES');
