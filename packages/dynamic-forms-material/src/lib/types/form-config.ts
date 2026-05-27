import { FormConfig, NarrowFields, RegisteredFieldTypes, InferFormValue } from '@ng-forge/dynamic-forms';
import { MaterialConfig } from '../models/material-config';

/** Material-specific props that can be set at form level and cascade to all fields. */
export type MatFormProps = MaterialConfig;

/** Material-specific FormConfig with type-safe defaultProps. */
export type MatFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, MatFormProps>;
