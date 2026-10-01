import { DynamicText } from '@ng-forge/dynamic-forms';
import { MultiCheckboxField } from '@ng-forge/dynamic-forms/integration';

export interface NativeMultiCheckboxProps {
  hint?: DynamicText;
}

export type NativeMultiCheckboxField<T> = MultiCheckboxField<T, NativeMultiCheckboxProps>;
