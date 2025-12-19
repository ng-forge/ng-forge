import { ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { RadioField } from '@ng-forge/dynamic-forms/integration';

export interface IonicRadioProps<T> {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  compareWith?: (o1: T, o2: T) => boolean;
}
export type IonicRadioField<T> = RadioField<T, IonicRadioProps<T>>;
export type IonicRadioComponent<T> = ValueFieldComponent<IonicRadioField<T>>;
