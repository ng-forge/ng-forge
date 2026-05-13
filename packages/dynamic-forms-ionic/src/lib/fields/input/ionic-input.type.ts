import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';

export interface IonicInputProps extends InputProps {
  fill?: 'solid' | 'outline';
  shape?: 'round';
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  hint?: DynamicText;
  errorText?: DynamicText;
  counter?: boolean;
  clearInput?: boolean;
}

export type IonicInputField = InputField<IonicInputProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type IonicInputComponent = ValueFieldComponent<IonicInputField>;
