import { DynamicText } from '@ng-forge/dynamic-forms';
import { MultiCheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface BsMultiCheckboxProps {
  switch?: boolean;
  inline?: boolean;
  reverse?: boolean;
  hint?: DynamicText;
}

export type BsMultiCheckboxField<T> = MultiCheckboxField<T, BsMultiCheckboxProps>;
