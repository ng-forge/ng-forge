import { FieldDef } from './field-def';
import { FieldWithValidation } from './field-with-validation';
import { WithInputSignals } from '../../models';
import { Prettify } from '../../models/prettify';

export interface BaseCheckedField<TProps extends Record<string, unknown>> extends FieldDef<TProps>, FieldWithValidation {
  checked?: boolean;

  defaultValue?: boolean;

  placeholder?: string;

  required?: boolean;
}

export function isCheckedField<TProps extends Record<string, unknown>>(field: FieldDef<TProps>): field is BaseCheckedField<TProps> {
  return 'checked' in field && typeof (field as { checked: unknown }).checked === 'boolean';
}

type ExcludedKeys =
  | 'type'
  | 'key'
  | 'conditionals'
  | 'defaultValue'
  | 'checked'
  | 'disabled'
  | 'readonly'
  | 'hidden'
  | 'col'
  | keyof FieldWithValidation;

export type CheckedFieldComponent<T extends BaseCheckedField<any>> = Prettify<WithInputSignals<Omit<T, ExcludedKeys>>>;
