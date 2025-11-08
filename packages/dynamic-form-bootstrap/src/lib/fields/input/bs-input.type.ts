import { DynamicText, InputField, InputProps, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsInputProps extends InputProps {
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  helpText?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
  plaintext?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export type BsInputField = InputField<BsInputProps>;

export type BsInputComponent = ValueFieldComponent<BsInputField>;
