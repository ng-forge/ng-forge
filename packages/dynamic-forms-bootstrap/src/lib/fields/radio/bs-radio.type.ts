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

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type BsRadioComponent = ValueFieldComponent<BsRadioField<ValueType>>;
