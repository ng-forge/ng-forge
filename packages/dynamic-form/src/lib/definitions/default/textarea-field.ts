import { BaseValueField } from '../base';
import { DynamicText } from '../../models';

export interface TextareaProps {
  placeholder?: DynamicText;
  rows?: number;
  cols?: number | undefined;
}

export interface TextareaField<TProps = TextareaProps> extends BaseValueField<TProps, string> {
  type: 'textarea';

  maxLength?: number | undefined;
}
