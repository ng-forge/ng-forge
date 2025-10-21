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
 * Utility type to extract nested object types from dot notation keys
 */
export type ParseNestedKey<T extends string> = T extends `${infer Head}.${infer Tail}`
  ? { [K in Head]: ParseNestedKey<Tail> }
  : { [K in T]: unknown };

/**
 * Merge nested object types
 */
export type MergeObjects<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;
};

/**
 * Advanced form result inference that handles nested keys
 */
export type InferFormResultAdvanced<T extends readonly InferenceFieldConfig[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends InferenceFieldConfig
    ? Rest extends readonly InferenceFieldConfig[]
      ? MergeObjects<
          ParseNestedKey<First['key']> extends { [K in First['key']]: unknown }
            ? { [K in First['key']]: First['type'] extends keyof FieldTypeMap ? FieldTypeMap[First['type']] : unknown }
            : ParseNestedKey<First['key']>,
          InferFormResultAdvanced<Rest>
        >
      : ParseNestedKey<First['key']> extends { [K in First['key']]: unknown }
      ? { [K in First['key']]: First['type'] extends keyof FieldTypeMap ? FieldTypeMap[First['type']] : unknown }
      : ParseNestedKey<First['key']>
    : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {}
  : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {};
