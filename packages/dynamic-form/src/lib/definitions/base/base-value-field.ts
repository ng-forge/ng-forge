import { FieldDef } from './field-def';
import { FieldWithValidation } from './field-with-validation';
import { WithInputSignals } from '../../models/component-type';
import { Prettify } from '../../models/prettify';

export const ValueType = ['string', 'number', 'boolean', 'object', 'array', 'date'] as const;
export type ValueType = (typeof ValueType)[number];

export interface BaseValueField<TProps extends Record<string, unknown>, TValue> extends FieldDef<TProps>, FieldWithValidation {
  value?: TValue;

  defaultValue?: TValue;

  valueType?: ValueType;

  placeholder?: string;

  required?: boolean;
}

export function isValueField<TProps extends Record<string, unknown>, TValue extends ValueType>(
  field: FieldDef<TProps>
): field is BaseValueField<TProps, ValueType> {
  return (
    'value' in field &&
    'valueType' in field &&
    ValueType.includes(typeof (field as { valueType: unknown }).valueType as ValueType) &&
    typeof (field as { value: unknown; valueType: TValue }).value === field.valueType
  );
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
