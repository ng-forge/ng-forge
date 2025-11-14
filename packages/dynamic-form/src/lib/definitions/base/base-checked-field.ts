import { FieldDef } from './field-def';
import { FieldWithValidation } from './field-with-validation';
import { WithInputSignals } from '../../models';
import { Prettify } from '../../models/prettify';
import { DynamicText } from '../../pipes';

export interface BaseCheckedField<TProps> extends FieldDef<TProps>, FieldWithValidation {
  value?: boolean;

  /**
   * Placeholder text displayed when the field is empty.
   * Supports static strings, Observables, and Signals for dynamic content.
   */
  placeholder?: DynamicText;

  required?: boolean;
}

export function isCheckedField<TProps>(field: FieldDef<TProps>): field is BaseCheckedField<TProps> {
  return field.type === 'checkbox';
}

type ExcludedKeys =
  | 'type'
  | 'conditionals'
  | 'value'
  | 'disabled'
  | 'readonly'
  | 'hidden'
  | 'col'
  | keyof FieldWithValidation;

export type CheckedFieldComponent<T extends BaseCheckedField<any>> = Prettify<WithInputSignals<Omit<T, ExcludedKeys>>>;
