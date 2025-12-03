import { FieldDef } from './field-def';
import { FieldWithValidation } from './field-with-validation';
import { WithInputSignals } from '../../models/component-type';
import { Prettify } from '../../models/prettify';
import { DynamicText } from '../../models/types/dynamic-text';

/**
 * Supported primitive value types for form fields.
 * This type represents all possible value types that can be used in form fields.
 */
export type ValueType = string | number | boolean | Date | object | unknown[];

export interface BaseValueField<TProps, TValue> extends FieldDef<TProps>, FieldWithValidation {
  value?: TValue;

  /**
   * Placeholder text displayed when the field is empty.
   * Supports static strings, Observables, and Signals for dynamic content.
   */
  placeholder?: DynamicText;

  required?: boolean;
}

export function isValueField<TProps>(field: FieldDef<TProps>): field is BaseValueField<TProps, ValueType> {
  return 'value' in field;
}

type ExcludedKeys =
  | 'type'
  | 'conditionals'
  | 'value'
  | 'valueType'
  | 'disabled'
  | 'readonly'
  | 'hidden'
  | 'col'
  | 'minValue'
  | 'maxValue'
  | 'step'
  // Exclude validation config, but keep validationMessages for component use
  | 'required'
  | 'email'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'validators'
  | 'logic'
  | 'schemas';

export type ValueFieldComponent<T extends BaseValueField<any, unknown>> = Prettify<WithInputSignals<Omit<T, ExcludedKeys>>>;
