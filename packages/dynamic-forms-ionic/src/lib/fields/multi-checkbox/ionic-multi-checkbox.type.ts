import { DynamicText, ValueType } from '@ng-forge/dynamic-forms';
import { ValueFieldComponent } from '@ng-forge/dynamic-forms/integration';
import { MultiCheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface IonicMultiCheckboxProps {
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  justify?: 'start' | 'end' | 'space-between';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  hint?: DynamicText;
}

export type IonicMultiCheckboxField<T> = MultiCheckboxField<T, IonicMultiCheckboxProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type IonicMultiCheckboxComponent = ValueFieldComponent<IonicMultiCheckboxField<ValueType>>;
