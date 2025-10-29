import { BaseValueField } from '../base';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

type InputProps = {
  type: InputType;
};

export interface InputField<TProps extends Record<string, unknown> = InputProps> extends BaseValueField<TProps, string> {
  type: 'input';
}
