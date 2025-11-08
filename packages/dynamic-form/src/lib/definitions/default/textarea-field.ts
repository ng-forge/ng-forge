import { BaseValueField } from '../base';

type TextareaProps = {
  rows?: number;
  cols?: number | undefined;
};

export interface TextareaField<TProps = TextareaProps> extends BaseValueField<TProps, string> {
  type: 'textarea';

  maxLength?: number | undefined;
}
