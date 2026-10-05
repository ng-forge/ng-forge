import { DynamicText } from '@ng-forge/dynamic-forms';
import { CheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface NativeCheckboxProps {
  hint?: DynamicText;
}

export type NativeCheckboxField = CheckboxField<NativeCheckboxProps>;
