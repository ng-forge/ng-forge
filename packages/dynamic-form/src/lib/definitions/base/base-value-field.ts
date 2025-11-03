import { FieldDef } from './field-def';
import { FieldWithValidation } from './field-with-validation';
import { WithInputSignals } from '../../models';
import { Prettify } from '../../models/prettify';

export const ValueType = ['string', 'number', 'boolean', 'object', 'array', 'date'] as const;
export type ValueType = (typeof ValueType)[number];

export interface BaseValueField<TProps extends Record<string, unknown>, TValue> extends FieldDef<TProps>, FieldWithValidation {
  value?: TValue;

  defaultValue?: TValue;

  placeholder?: string;

  required?: boolean;
}

export function isValueField<TProps extends Record<string, unknown>>(
  field: FieldDef<TProps>
): field is BaseValueField<TProps, ValueType> {
  return 'value' in field;
}

type ExcludedKeys =
  | 'type'
  | 'key'
  | 'conditionals'
  | 'value'
  | 'valueType'
  | 'defaultValue'
  | 'disabled'
  | 'readonly'
  | 'hidden'
  | 'col'
  | keyof FieldWithValidation;

export type ValueFieldComponent<T extends BaseValueField<any, any>> = Prettify<WithInputSignals<Omit<T, ExcludedKeys>>>;
