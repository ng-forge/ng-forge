import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { MultiCheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface BsMultiCheckboxProps {
  switch?: boolean;
  inline?: boolean;
  reverse?: boolean;
  helpText?: DynamicText;
}

export type BsMultiCheckboxField<T> = MultiCheckboxField<T, BsMultiCheckboxProps>;

export type BsMultiCheckboxComponent = ValueFieldComponent<BsMultiCheckboxField<ValueType>>;
