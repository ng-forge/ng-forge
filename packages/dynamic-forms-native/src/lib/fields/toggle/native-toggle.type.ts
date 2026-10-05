import { DynamicText } from '@ng-forge/dynamic-forms';
import { ToggleField } from '@ng-forge/dynamic-forms/integration';

export interface NativeToggleProps {
  hint?: DynamicText;
}

export type NativeToggleField = ToggleField<NativeToggleProps>;
