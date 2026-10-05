import { InjectionToken, Type } from '@angular/core';

/**
 * A component that renders the scenario's form in place of `<form dynamic-form>`, for an adapter
 * whose fields need a renderer of their own (ng-native). It receives `config` and `theme` inputs.
 */
export const EXAMPLE_FORM_HOST = new InjectionToken<Type<unknown>>('EXAMPLE_FORM_HOST');
