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

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type BsCheckboxComponent = CheckedFieldComponent<BsCheckboxField>;
