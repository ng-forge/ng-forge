import type { FormConfig } from '../models/form-config';
import type { NarrowFields } from '../models/registry/field-registry';
import type { InferFormValue } from '../models/types/form-value-inference';
import type { FormSchema } from '@ng-forge/dynamic-forms/schema';

/**
 * Type-safe form config builder that ensures schema matches field structure.
 *
 * @typeParam TFields - The field definitions array (narrowed via `as const`)
 * @typeParam TProps - Optional form-level default props type
 * @param config - The form configuration object
 * @returns The same configuration with proper type inference
 */
export function formConfig<const TFields extends NarrowFields, TProps extends object = Record<string, unknown>>(
  config: Omit<FormConfig<TFields, InferFormValue<TFields>, TProps>, 'schema'> & {
    schema?: FormSchema<InferFormValue<TFields>>;
  },
): FormConfig<TFields, InferFormValue<TFields>, TProps> {
  return config as FormConfig<TFields, InferFormValue<TFields>, TProps>;
}
