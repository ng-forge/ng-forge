import { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import { PRIMENG_FIELD_TYPES } from '../config/primeng-field-config';

/**
 * Provides PrimeNG field type definitions for the dynamic form system.
 *
 * Use this function in your application providers to register PrimeNG field components.
 *
 * @example
 * ```typescript
 * // Application-level setup
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-form';
 * import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withPrimeNGFields())
 *   ]
 * };
 * ```
 *
 * @returns Array of field type definitions for PrimeNG components
 */
export function withPrimeNGFields(): FieldTypeDefinition[] {
  return PRIMENG_FIELD_TYPES;
}
