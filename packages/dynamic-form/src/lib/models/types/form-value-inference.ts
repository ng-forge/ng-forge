import { BaseCheckedField, BaseValueField, FieldDef } from '../../definitions';
import { RegisteredFieldTypes } from '../registry/field-registry';

type ExtractFieldValue<T> = T extends { value: infer V; required: true } ? V : T extends { value: infer V } ? V | undefined : unknown;

/**
 * Infer form value type from a specific array of field definitions
 */
export type InferFormValue<T extends readonly RegisteredFieldTypes[]> = {
  [K in T[number] as K['key']]: ExtractFieldValue<K>;
};

/**
 * Infer form value type from registered field definitions (legacy)
 */
export type InferGlobalFormValue = RegisteredFieldTypes extends FieldDef<Record<string, unknown>>
  ? {
      [K in RegisteredFieldTypes['key']]: any; // TODO: extract actual value type from field
    }
  : Record<string, unknown>;
