import { BaseValueField } from '../base';
import { DynamicText } from '../../models';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

export interface InputProps {
  type?: InputType;
  placeholder?: DynamicText;
}

export type InputField<TProps = InputProps> = BaseValueField<TProps, string>;
