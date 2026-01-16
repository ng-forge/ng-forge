import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { RadioField } from '@ng-forge/dynamic-forms/integration';

export interface BsRadioProps {
  inline?: boolean;
  reverse?: boolean;
  buttonGroup?: boolean;
  buttonSize?: 'sm' | 'lg';
  hint?: DynamicText;
}

export type BsRadioField<T> = RadioField<T, BsRadioProps>;

export type BsRadioComponent = ValueFieldComponent<BsRadioField<ValueType>>;
