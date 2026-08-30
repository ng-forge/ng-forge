import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';
import type { BootstrapConfig } from '@ng-forge/dynamic-forms-bootstrap/shared';

/** Bootstrap-specific props that can be set at form level and cascade to all fields. */
export type BsFormProps = BootstrapConfig;

/** Bootstrap-specific FormConfig with type-safe defaultProps. */
export type BsFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, BsFormProps>;
