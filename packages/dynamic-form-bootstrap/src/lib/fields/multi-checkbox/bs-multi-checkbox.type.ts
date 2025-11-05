import { DynamicText, MultiCheckboxField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsMultiCheckboxProps<T> extends Record<string, unknown> {
  switch?: boolean;
  inline?: boolean;
  reverse?: boolean;
  helpText?: DynamicText;
}

export type BsMultiCheckboxField<T> = MultiCheckboxField<T, BsMultiCheckboxProps<T>>;

export type BsMultiCheckboxComponent<T> = ValueFieldComponent<BsMultiCheckboxField<T>>;
