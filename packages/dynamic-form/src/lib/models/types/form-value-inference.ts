import { BaseCheckedField, BaseValueField, FieldDef } from '../../definitions';
import { RegisteredFieldTypes } from '../registry/field-registry';

/**
 * Infer form value type from a specific array of field definitions
 */
export type InferFormValue<T extends readonly RegisteredFieldTypes[]> = {
  [K in T[number] as K['key']]: K extends BaseValueField<any, infer TValue>
    ? K['required'] extends true
      ? TValue
      : TValue | undefined
    : K extends BaseCheckedField<any>
    ? K['required'] extends true
      ? boolean
      : boolean | undefined
    : unknown;
};

/**
 * Infer form value type from registered field definitions (legacy)
 */
export type InferGlobalFormValue = RegisteredFieldTypes extends FieldDef<Record<string, unknown>>
  ? {
      [K in RegisteredFieldTypes['key']]: any; // TODO: extract actual value type from field
    }
  : Record<string, unknown>;
