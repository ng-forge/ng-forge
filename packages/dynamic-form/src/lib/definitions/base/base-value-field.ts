import { FieldDef } from './field-def';
import { FieldWithValidation } from './field-with-validation';
import { WithInputSignals } from '../../models';
import { Prettify } from '../../models/prettify';
import { DynamicText } from '../../pipes';

export const ValueType = ['string', 'number', 'boolean', 'object', 'array', 'date'] as const;
export type ValueType = (typeof ValueType)[number];

export interface BaseValueField<TProps, TValue> extends FieldDef<TProps>, FieldWithValidation {
  value?: TValue;

  defaultValue?: TValue;

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
  | 'defaultValue'
  | 'disabled'
  | 'readonly'
  | 'hidden'
  | 'col'
  | keyof FieldWithValidation;

export type ValueFieldComponent<T extends BaseValueField<any, unknown>> = Prettify<WithInputSignals<Omit<T, ExcludedKeys>>>;
