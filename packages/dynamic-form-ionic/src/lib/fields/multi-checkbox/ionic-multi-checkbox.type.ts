import { ValueFieldComponent, MultiCheckboxField } from '@ng-forge/dynamic-form';

export interface IonicMultiCheckboxProps<T> extends Record<string, unknown> {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
}

export type IonicMultiCheckboxField<T> = MultiCheckboxField<T, IonicMultiCheckboxProps<T>>;

export type IonicMultiCheckboxComponent<T> = ValueFieldComponent<IonicMultiCheckboxField<T>>;
