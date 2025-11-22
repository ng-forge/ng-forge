import { DynamicText, InputFieldDef, InputProps, ValueFieldComponent } from '@ng-forge/dynamic-forms';

export interface IonicInputProps extends InputProps {
  fill?: 'solid' | 'outline';
  shape?: 'round';
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  helperText?: DynamicText;
  errorText?: DynamicText;
  counter?: boolean;
  maxlength?: number;
  clearInput?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export type IonicInputField = InputFieldDef<IonicInputProps>;

export type IonicInputComponent = ValueFieldComponent<IonicInputField>;
