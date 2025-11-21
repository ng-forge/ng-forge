import { MultiCheckboxField, ValueFieldComponent } from '@ng-forge/dynamic-forms';

export interface IonicMultiCheckboxProps<T> {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
}

export type IonicMultiCheckboxField<T> = MultiCheckboxField<T, IonicMultiCheckboxProps<T>>;

export type IonicMultiCheckboxComponent<T> = ValueFieldComponent<IonicMultiCheckboxField<T>>;
