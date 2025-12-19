import { BaseValueField, DynamicText } from '@ng-forge/dynamic-forms';

export interface TextareaProps {
  placeholder?: DynamicText;
  rows?: number;
  cols?: number | undefined;
}

export interface TextareaField<TProps = TextareaProps> extends BaseValueField<TProps, string> {
  type: 'textarea';
  maxLength?: number | undefined;
}
