import { DynamicText } from '@ng-forge/dynamic-forms';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';

export interface NativeInputProps extends InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  hint?: DynamicText;
}

export type NativeInputField = InputField<NativeInputProps>;
