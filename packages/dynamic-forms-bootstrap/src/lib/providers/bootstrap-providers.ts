import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { BOOTSTRAP_FIELD_TYPES } from '../config/bootstrap-field-config';

/**
 * Provides Bootstrap field types for the dynamic form system.
 * Use with provideDynamicForm(...withBootstrapFields())
 *
 * @example
 * ```typescript
 * // Application-level setup
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-form';
 * import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withBootstrapFields())
 *   ]
 * };
 * ```
 *
 * @returns Array of field type definitions for Bootstrap components
 */
export function withBootstrapFields(): FieldTypeDefinition[] {
  return BOOTSTRAP_FIELD_TYPES;
}
