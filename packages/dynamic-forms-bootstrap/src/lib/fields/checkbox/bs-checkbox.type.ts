import { CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';
import { CheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface BsCheckboxProps {
  switch?: boolean;
  inline?: boolean;
  reverse?: boolean;
  indeterminate?: boolean;
  hint?: DynamicText;
}

export type BsCheckboxField = CheckboxField<BsCheckboxProps>;

export type BsCheckboxComponent = CheckedFieldComponent<BsCheckboxField>;
