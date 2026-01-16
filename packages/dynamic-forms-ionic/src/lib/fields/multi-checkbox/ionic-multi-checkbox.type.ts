import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { MultiCheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface IonicMultiCheckboxProps {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  hint?: DynamicText;
}

export type IonicMultiCheckboxField<T> = MultiCheckboxField<T, IonicMultiCheckboxProps>;

export type IonicMultiCheckboxComponent = ValueFieldComponent<IonicMultiCheckboxField<ValueType>>;
