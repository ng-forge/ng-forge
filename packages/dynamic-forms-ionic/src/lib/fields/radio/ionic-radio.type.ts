import { DynamicText, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-forms';
import { RadioField } from '@ng-forge/dynamic-forms/integration';

export interface IonicRadioProps {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  compareWith?: (o1: ValueType, o2: ValueType) => boolean;
  hint?: DynamicText;
}
export type IonicRadioField<T> = RadioField<T, IonicRadioProps>;
/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type IonicRadioComponent = ValueFieldComponent<IonicRadioField<ValueType>>;
