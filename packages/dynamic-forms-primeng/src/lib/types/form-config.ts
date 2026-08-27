import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';
import type { PrimeNGConfig } from '@ng-forge/dynamic-forms-primeng/shared';

/** PrimeNG-specific props that can be set at form level and cascade to all fields. */
export type PrimeFormProps = PrimeNGConfig;

/** PrimeNG-specific FormConfig with type-safe defaultProps. */
export type PrimeFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, PrimeFormProps>;
