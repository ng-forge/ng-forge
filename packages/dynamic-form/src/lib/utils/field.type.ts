import { InputOfType } from './input-of.type';

/**
 * Prettify utility to make complex types more readable
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Transform a model into field input types
 */
export type FieldType<T extends object> = {
  [K in keyof T]-?: InputOfType<T[K]>;
} & {};

/**
 * Field configuration interface for type inference
 */
export interface InferenceFieldConfig {
  key: string;
  type: string;
  props?: Record<string, unknown>;
}

/**
 * Global field type registry for type inference
 * This can be augmented by library users through module augmentation
 */
export interface FieldTypeMap {
  input: string;
  email: string;
  password: string;
  text: string;
  textarea: string;
  number: number;
  checkbox: boolean;
  radio: string;
  select: string;
  'multi-select': string[];
  date: Date;
  datepicker: Date;
  datetime: Date;
  time: string;
  toggle: boolean;
  slider: number;
  range: [number, number];
  file: File | null;
  'multi-file': File[];
  // Users can extend this via module augmentation
}

/**
 * Extract the result type from a field configuration array
 */
export type InferFormResult<T extends readonly InferenceFieldConfig[]> = Prettify<{
  [K in T[number] as K['key']]: K['type'] extends keyof FieldTypeMap ? FieldTypeMap[K['type']] : unknown;
}>;

/**
 * Simplified form result inference with nested key support
 * Handles basic dot notation like 'user.name' -> { user: { name: string } }
 */
export type InferFormResultAdvanced<T extends readonly InferenceFieldConfig[]> = {
  [K in T[number] as K['key'] extends `${infer Head}.${string}` ? Head : K['key']]: K['key'] extends `${string}.${infer Tail}`
    ? { [P in Tail]: K['type'] extends keyof FieldTypeMap ? FieldTypeMap[K['type']] : unknown }
    : K['type'] extends keyof FieldTypeMap
    ? FieldTypeMap[K['type']]
    : unknown;
};
