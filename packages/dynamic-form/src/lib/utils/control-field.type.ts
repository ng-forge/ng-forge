import type { InputSignal } from '@angular/core';
import { InputOfType } from './input-of.type';

/**
 * Properties that are provided by FormControl interfaces and should be excluded from field types
 */
type ControlProvidedProperties =
  | 'value'
  | 'checked'
  | 'disabled'
  | 'touched'
  | 'invalid'
  | 'errors'
  | 'readonly'
  | 'hidden'
  | 'pending'
  | 'dirty'
  | 'name';

/**
 * Properties that need special handling for form controls
 * These properties are optional in field definitions but required as non-optional signals in control interfaces
 */
interface ControlRequiredProperties {
  required: boolean;
}

/**
 * Transforms field properties to be compatible with form control interfaces
 * Excludes properties provided by FormControl interfaces and handles special typing for control-required properties
 */
export type ControlFieldType<T extends object> = {
  [K in keyof Omit<T, ControlProvidedProperties>]: K extends keyof ControlRequiredProperties
    ? InputSignal<ControlRequiredProperties[K]>
    : InputOfType<T[K]>;
};

/**
 * For components that implement both FormValueControl and field interfaces
 */
export type ValueControlFieldType<T extends object, TValue = unknown> = ControlFieldType<T>;

/**
 * For components that implement both FormCheckboxControl and field interfaces
 */
export type CheckboxControlFieldType<T extends object> = ControlFieldType<T>;
