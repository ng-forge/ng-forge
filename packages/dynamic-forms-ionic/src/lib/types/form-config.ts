import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';
import { IonicConfig } from '../models/ionic-config';

/** Ionic-specific props that can be set at form level and cascade to all fields. */
export type IonicFormProps = IonicConfig;

/** Ionic-specific FormConfig with type-safe defaultProps. */
export type IonicFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, IonicFormProps>;
