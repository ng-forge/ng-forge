import type { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import type { Provider } from '@angular/core';
import { IONIC_FIELD_TYPES } from '../config/ionic-field-config';
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
import { IonicConfig } from '../models/ionic-config';
import { IONIC_CONFIG } from '../models/ionic-config.token';

/**
 * Configure dynamic forms with Ionic field types.
 * Provides all Ionic field types for use with provideDynamicForm.
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
 * @returns Array of field type definitions for Ionic components
 */
export function withIonicFields(): FieldTypeDefinition[] {
  return IONIC_FIELD_TYPES;
}

/**
 * Configure global defaults for Ionic fields.
 *
 * This function provides global configuration that applies to all Ionic fields
 * in the form. Field-level props will override these global defaults.
 *
 * @param config - Global Ionic configuration
 * @returns Array of Angular providers
 *
 * @example
 * ```typescript
 * // Application-level setup with global Ionic config
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withIonicFields()),
 *     ...withIonicConfig({ fill: 'outline', shape: 'round' })
 *   ]
 * });
 * ```
 *
 * @public
 */
export function withIonicConfig(config: IonicConfig): Provider[] {
  return [
    {
      provide: IONIC_CONFIG,
      useValue: config,
    },
  ];
}

/**
 * Module augmentation to extend the global DynamicFormFieldRegistry
 * with Ionic field types
 */
declare module '@ng-forge/dynamic-form' {
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
