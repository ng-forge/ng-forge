import { FieldDef, SchemaMetadata } from './field-config';

export interface DynamicFormSchema<TValue = unknown> {
  readonly fieldDefs: readonly FieldDef[];
  readonly metadata?: SchemaMetadata;
}
