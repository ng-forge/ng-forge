import { DynamicText, InputField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface IonicInputProps extends Record<string, unknown> {
  fill?: 'solid' | 'outline';
  shape?: 'round';
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  helperText?: DynamicText;
  errorText?: DynamicText;
  counter?: boolean;
  maxlength?: number;
  clearInput?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';
}

export type IonicInputField = InputField<IonicInputProps>;

export type IonicInputComponent = ValueFieldComponent<IonicInputField>;
