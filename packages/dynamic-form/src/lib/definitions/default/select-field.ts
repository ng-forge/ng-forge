import { BaseValueField } from '../base';

export interface SelectOption<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Interface for select field fields
 */
export interface SelectField<T, TProps extends Record<string, unknown>> extends BaseValueField<TProps, T> {
  type: 'select';

  options: SelectOption<T>[];
}
