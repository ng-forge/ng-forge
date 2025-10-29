import { APP_INITIALIZER, inject } from '@angular/core';
import { FieldRegistry } from '../core/field-registry';
import { FieldTypeDefinition } from '../models/field-type';
import { DynamicFormFeature } from './dynamic-form-providers';

/**
 * Registers built-in field types that are always available
 * These are registered automatically and users cannot customize them
 */
function registerBuiltInFieldTypes(): () => void {
  return () => {
    const registry = inject(FieldRegistry);

    // Register built-in field types - always available and non-customizable
    const builtInTypes: FieldTypeDefinition[] = [
      // Row field type for horizontal layouts
      {
        name: 'row',
        loadComponent: () => import('../fields/row/row-field.component').then((m) => m.RowFieldComponent),
      },

      // Group field type for logical groupings
      {
        name: 'group',
        loadComponent: () => import('../fields/group/group-field.component').then((m) => m.GroupFieldComponent),
      },
    ];

    registry.registerTypes(builtInTypes);
  };
}

/**
 * Provide built-in field types for the dynamic form library
 * This includes row and group field types - always available and non-customizable
 */
export function withBuiltInFields(): DynamicFormFeature {
  return {
    providers: [
      {
        provide: APP_INITIALIZER,
        useFactory: registerBuiltInFieldTypes,
        multi: true,
      },
    ],
  };
}

/**
 * Extended configuration to include built-in field types automatically
 * This is a convenience function that combines withBuiltInFields with provideDynamicForm
 */
export function provideDynamicFormWithBuiltIns(...features: any[]): any {
  // This would be imported from the main providers file to avoid circular deps
  // For now, keeping it simple
  return [withBuiltInFields(), ...features];
}
