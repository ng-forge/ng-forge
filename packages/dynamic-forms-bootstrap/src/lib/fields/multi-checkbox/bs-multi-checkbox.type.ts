import { DynamicText, ValueType } from '@ng-forge/dynamic-forms';
import { ValueFieldComponent } from '@ng-forge/dynamic-forms/integration';
import { MultiCheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface BsMultiCheckboxProps {
  switch?: boolean;
  inline?: boolean;
  reverse?: boolean;
  hint?: DynamicText;
}

export type BsMultiCheckboxField<T> = MultiCheckboxField<T, BsMultiCheckboxProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type BsMultiCheckboxComponent = ValueFieldComponent<BsMultiCheckboxField<ValueType>>;
