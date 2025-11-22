import { DynamicText } from '../pipes';

export interface FieldOption<T = unknown> {
  label: DynamicText;
  value: T;
  disabled?: boolean;
  [key: string]: unknown;
}
