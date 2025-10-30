import { BaseValueField } from '../base';

export interface MultiCheckboxOption<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface MultiCheckboxField<TValue, TProps extends Record<string, unknown>>
  extends BaseValueField<TProps, TValue> {
  type: 'multi-checkbox';

  options: MultiCheckboxOption<TValue>[];
}
