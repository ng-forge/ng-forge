import { CheckboxField, CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';

export interface BsCheckboxProps {
  switch?: boolean;
  inline?: boolean;
  reverse?: boolean;
  indeterminate?: boolean;
  helpText?: DynamicText;
}

export type BsCheckboxField = CheckboxField<BsCheckboxProps>;

export type BsCheckboxComponent = CheckedFieldComponent<BsCheckboxField>;
