import { BaseValueField } from '../base/base-value-field';
import { DynamicText } from '../../models/types/dynamic-text';

export interface TextareaProps {
  placeholder?: DynamicText;
  rows?: number;
  cols?: number | undefined;
}

export interface TextareaField<TProps = TextareaProps> extends BaseValueField<TProps, string> {
  type: 'textarea';
  maxLength?: number | undefined;
}
