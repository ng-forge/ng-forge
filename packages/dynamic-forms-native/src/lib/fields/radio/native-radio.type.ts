import { DynamicText } from '@ng-forge/dynamic-forms';
import { RadioField } from '@ng-forge/dynamic-forms/integration';

export interface NativeRadioProps {
  hint?: DynamicText;
}

export type NativeRadioField<T> = RadioField<T, NativeRadioProps>;
