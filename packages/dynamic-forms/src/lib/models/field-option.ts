import { DynamicText } from './types/dynamic-text';

export interface FieldOption<T = unknown> {
  label: DynamicText;
  value: T;
  disabled?: boolean;
  [key: string]: unknown;
}
