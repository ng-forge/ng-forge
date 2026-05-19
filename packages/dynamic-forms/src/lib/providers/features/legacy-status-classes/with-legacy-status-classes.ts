import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';
import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';

/**
 * Opt into Angular Signal Forms' legacy `.ng-touched` / `.ng-invalid` /
 * `.ng-dirty` / `.ng-pristine` / `.ng-untouched` / `.ng-pending` /
 * `.ng-valid` CSS classes on form-bound elements.
 *
 * Wires Angular's `@angular/forms/signals/compat` `NG_STATUS_CLASSES` strategy
 * via `provideSignalFormsConfig`. Without this feature the modern Signal Forms
 * class strategy is active, which omits the legacy `ng-*` classes.
 *
 * @example Opt in once at the application root
 * ```typescript
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(
 *       ...withMaterialFields(),
 *       withLegacyStatusClasses()
 *     )
 *   ]
 * });
 * ```
 *
 * @returns A DynamicFormFeature that enables the legacy `ng-*` class strategy
 *
 * @public
 */
export function withLegacyStatusClasses(): DynamicFormFeature<'legacy-status-classes'> {
  return createFeature('legacy-status-classes', [...provideSignalFormsConfig({ classes: NG_STATUS_CLASSES })]);
}
