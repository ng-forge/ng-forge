import type { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import type { Provider } from '@angular/core';
import { IONIC_FIELD_TYPES } from '../config/ionic-field-config';
import { IonicConfig } from '../models/ionic-config';
import { IONIC_CONFIG } from '../models/ionic-config.token';
import {
  IonicButtonField,
  IonicCheckboxField,
  IonicDatepickerField,
  IonicInputField,
  IonicMultiCheckboxField,
  IonicNextButtonField,
  IonicPreviousButtonField,
  IonicRadioField,
  IonicSelectField,
  IonicSliderField,
  IonicSubmitButtonField,
  IonicTextareaField,
  IonicToggleField,
} from '../fields';

/**
 * Field type definitions with optional config providers
 */
export type FieldTypeDefinitionsWithConfig = FieldTypeDefinition[] & {
  __configProviders?: Provider[];
};

/**
 * Configure dynamic forms with Ionic field types.
 * Provides all Ionic field types for use with provideDynamicForm.
 *
 * @param config - Optional global configuration for Ionic form fields
 *
 * @example
 * ```typescript
 * // Application-level setup
 * import { ApplicationConfig } from '@angular/core';
 * import { provideDynamicForm } from '@ng-forge/dynamic-form';
 * import { withIonicFields } from '@ng-forge/dynamic-form-ionic';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(...withIonicFields())
 *   ]
 * };
 * ```
 *
 * @example
 * ```typescript
 * // With global configuration
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideDynamicForm(
 *       ...withIonicFields({
 *         fill: 'outline',
 *         labelPlacement: 'floating'
 *       })
 *     )
 *   ]
 * };
 * ```
 *
 * @returns Array of field type definitions for Ionic components
 */
export function withIonicFields(config?: IonicConfig): FieldTypeDefinitionsWithConfig {
  const fields = IONIC_FIELD_TYPES as FieldTypeDefinitionsWithConfig;

  if (config) {
    fields.__configProviders = [
      {
        provide: IONIC_CONFIG,
        useValue: config,
      },
    ];
  }

  return fields;
}

/**
 * Module augmentation to extend the global DynamicFormFieldRegistry
 * with Ionic field types
 */
declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormFieldRegistry {
    input: IonicInputField;
    select: IonicSelectField<any>;
    checkbox: IonicCheckboxField;
    button: IonicButtonField<any>;
    submit: IonicSubmitButtonField;
    next: IonicNextButtonField;
    previous: IonicPreviousButtonField;
    textarea: IonicTextareaField;
    radio: IonicRadioField<any>;
    'multi-checkbox': IonicMultiCheckboxField<any>;
    datepicker: IonicDatepickerField;
    slider: IonicSliderField;
    toggle: IonicToggleField;
  }
}
