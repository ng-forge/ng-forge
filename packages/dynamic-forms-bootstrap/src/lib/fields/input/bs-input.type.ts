import { DynamicText, InputFieldDef, InputProps, ValueFieldComponent } from '@ng-forge/dynamic-forms';

export interface BsInputProps extends InputProps {
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  helpText?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
  plaintext?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export type BsInputField = InputFieldDef<BsInputProps>;

export type BsInputComponent = ValueFieldComponent<BsInputField>;
