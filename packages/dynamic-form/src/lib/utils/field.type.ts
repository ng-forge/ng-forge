import { InputOfType } from './input-of.type';

export type FieldType<T extends object> = {
  [K in keyof T]-?: InputOfType<T[K]>;
} & {};
