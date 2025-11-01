import { BaseValueField } from '../base';

export interface RadioOption<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface RadioField<T, TProps extends Record<string, unknown>> extends BaseValueField<TProps, T> {
  type: 'radio';

  options: RadioOption<T>[];
}
