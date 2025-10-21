import {
  DynamicFormConfig,
  DynamicFormFeatureWithModel,
  InferenceFieldConfig,
  InferFormResult,
  Prettify,
  withConfig
} from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';

/**
 * Provide Material Design field types for dynamic forms.
 *
 * If you pass a config that includes a `fields` property, the result type will be inferred.
 */
export function withMaterialFields<TConfig extends DynamicFormConfig = DynamicFormConfig>(
  config?: TConfig
): DynamicFormFeatureWithModel<
  TConfig extends { fields: infer F } ? (F extends readonly InferenceFieldConfig[] ? Prettify<InferFormResult<F>> : unknown) : unknown
> {
  return withConfig({
    types: MATERIAL_FIELD_TYPES,
    ...(config ?? {}),
  } as TConfig);
}

/**
 * Enhanced Material provider with full type inference
 */
export function withTypedMaterialFields<TFields extends readonly InferenceFieldConfig[]>(
  config: DynamicFormConfig & {
    fields: TFields;
  }
): DynamicFormFeatureWithModel<Prettify<InferFormResult<TFields>>> {
  return withMaterialFields(config) as DynamicFormFeatureWithModel<Prettify<InferFormResult<TFields>>>;
}
