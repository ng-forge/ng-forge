import { DynamicText, InputField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsInputProps extends Record<string, unknown> {
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  helpText?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
  plaintext?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color';
}

export type BsInputField = InputField<BsInputProps>;

export type BsInputComponent = ValueFieldComponent<BsInputField>;
