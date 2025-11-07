import { CheckboxField, CheckedFieldComponent, DynamicText } from '@ng-forge/dynamic-form';

export interface BsCheckboxProps extends Record<string, unknown> {
  switch?: boolean;
  inline?: boolean;
  reverse?: boolean;
  indeterminate?: boolean;
  helpText?: DynamicText;
}

export type BsCheckboxField = CheckboxField<BsCheckboxProps>;

export type BsCheckboxComponent = CheckedFieldComponent<BsCheckboxField>;
