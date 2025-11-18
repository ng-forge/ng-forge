import type { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import type { Provider } from '@angular/core';
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
 * Provides all Material Design field types for use with provideDynamicForm.
 *
 * @example
 * ```typescript
 * // Application-level setup
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-form';
 * import { withMaterialFields } from '@ng-forge/dynamic-form-material';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withMaterialFields())
 *   ]
 * };
 * ```
 *
 * @returns Array of field type definitions for Material Design components
 */
export function withMaterialFields(): FieldTypeDefinition[] {
  return MATERIAL_FIELD_TYPES;
}

/**
 * Configure global defaults for Material Design fields.
 *
 * This function provides global configuration that applies to all Material fields
 * in the form. Field-level props will override these global defaults.
 *
 * @param config - Global Material configuration
 * @returns Array of Angular providers
 *
 * @example
 * ```typescript
 * // Application-level setup with global Material config
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withMaterialFields()),
 *     ...withMaterialConfig({ appearance: 'fill' })
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Component-level setup with comprehensive config
 * @Component({
 *   providers: [
 *     provideDynamicForm(...withMaterialFields()),
 *     ...withMaterialConfig({
 *       appearance: 'fill',
 *       subscriptSizing: 'fixed',
 *       disableRipple: true,
 *       labelPosition: 'before',
 *       datepickerTouchUi: true
 *     })
 *   ]
 * })
 * export class MyFormComponent { }
 * ```
 *
 * @public
 */
export function withMaterialConfig(config: MaterialConfig): Provider[] {
  return [
    {
      provide: MATERIAL_CONFIG,
      useValue: config,
    },
  ];
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
