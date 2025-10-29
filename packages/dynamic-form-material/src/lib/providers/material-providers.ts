import { inject, provideAppInitializer } from '@angular/core';
import { DynamicFormFeature, FieldRegistry } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';

/**
 * Configure dynamic forms with Material Design field types
 * Registers all Material Design field fields with the FieldRegistry
 */
export function withMaterial(): DynamicFormFeature {
  return {
    providers: [
      provideAppInitializer((): void => {
        const registry = inject(FieldRegistry);

        // Register material field types directly
        registry.registerTypes(MATERIAL_FIELD_TYPES);
      }),
    ],
  };
}

/**
 * Alias for better naming consistency with the app usage
 */
export const withMaterialFields = withMaterial;
