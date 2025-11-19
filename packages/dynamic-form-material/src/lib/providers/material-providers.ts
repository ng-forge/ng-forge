import type { FieldTypeDefinition, FieldTypeDefinitionWithConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';
import {
  MatButtonField,
  MatCheckboxField,
  MatDatepickerField,
  MatInputField,
  MatMultiCheckboxField,
  MatNextButtonField,
  MatPreviousButtonField,
  MatRadioField,
  MatSelectField,
  MatSliderField,
  MatSubmitButtonField,
  MatTextareaField,
  MatToggleField,
} from '../fields';
import { MaterialConfig } from '../models/material-config';
import { MATERIAL_CONFIG } from '../models/material-config.token';

/**
 * Configure dynamic forms with Material Design field types.
 *
 * This function provides all Material Design field types for use with provideDynamicForm.
 * Optionally accepts a global configuration object to set defaults for all Material fields.
 *
 * @param config - Optional global Material configuration
 * @returns Array of field type definitions
 *
 * @example
 * ```typescript
 * // Basic usage without config
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withMaterialFields())
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With global Material config
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withMaterialFields({ appearance: 'fill' }))
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Component-level setup with comprehensive config
 * @Component({
 *   providers: [
 *     provideDynamicForm(...withMaterialFields({
 *       appearance: 'fill',
 *       subscriptSizing: 'fixed',
 *       disableRipple: true,
 *       labelPosition: 'before',
 *       datepickerTouchUi: true
 *     }))
 *   ]
 * })
 * export class MyFormComponent { }
 * ```
 *
 * @public
 */
export function withMaterialFields(config?: MaterialConfig): FieldTypeDefinition[] | FieldTypeDefinitionWithConfig {
  const fields = [...MATERIAL_FIELD_TYPES] as FieldTypeDefinitionWithConfig;

  if (config) {
    fields.__configProviders = [
      {
        provide: MATERIAL_CONFIG,
        useValue: config,
      },
    ];
  }

  return fields;
}

/**
 * Module augmentation to extend the global DynamicFormFieldRegistry
 * with Material Design field types
 */
declare module '@ng-forge/dynamic-form' {
  interface DynamicFormFieldRegistry {
    input: MatInputField;
    select: MatSelectField<any>;
    checkbox: MatCheckboxField;
    button: MatButtonField<any>;
    submit: MatSubmitButtonField;
    next: MatNextButtonField;
    previous: MatPreviousButtonField;
    textarea: MatTextareaField;
    radio: MatRadioField<any>;
    'multi-checkbox': MatMultiCheckboxField<any>;
    datepicker: MatDatepickerField;
    slider: MatSliderField;
    toggle: MatToggleField;
  }
}
