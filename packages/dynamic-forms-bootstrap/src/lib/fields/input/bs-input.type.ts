import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';

export interface BsInputProps extends InputProps {
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  hint?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
  plaintext?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export type BsInputField = InputField<BsInputProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type BsInputComponent = ValueFieldComponent<BsInputField>;
