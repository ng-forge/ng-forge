import { DynamicText, MultiCheckboxField, ValueFieldComponent } from '@ng-forge/dynamic-forms';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface BsMultiCheckboxProps<T> {
  switch?: boolean;
  inline?: boolean;
  reverse?: boolean;
  helpText?: DynamicText;
}

export type BsMultiCheckboxField<T> = MultiCheckboxField<T, BsMultiCheckboxProps<T>>;

export type BsMultiCheckboxComponent<T> = ValueFieldComponent<BsMultiCheckboxField<T>>;
