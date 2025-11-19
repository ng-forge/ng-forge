import type { FieldTypeDefinition, FieldTypeDefinitionWithConfig } from '@ng-forge/dynamic-form';
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
 *
 * This function provides all Ionic field types for use with provideDynamicForm.
 * Optionally accepts a global configuration object to set defaults for all Ionic fields.
 *
 * @param config - Optional global Ionic configuration
 * @returns Array of field type definitions
 *
 * @example
 * ```typescript
 * // Basic usage without config
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withIonicFields())
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With global Ionic config
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDynamicForm(...withIonicFields({ fill: 'outline', shape: 'round' }))
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Component-level setup with comprehensive config
 * @Component({
 *   providers: [
 *     provideDynamicForm(...withIonicFields({
 *       fill: 'outline',
 *       shape: 'round',
 *       labelPlacement: 'floating',
 *       buttonSize: 'default',
 *       buttonExpand: 'block'
 *     }))
 *   ]
 * })
 * export class MyFormComponent { }
 * ```
 *
 * @public
 */
export function withIonicFields(config?: IonicConfig): FieldTypeDefinition[] | FieldTypeDefinitionWithConfig {
  const fields = [...IONIC_FIELD_TYPES] as FieldTypeDefinitionWithConfig;

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
