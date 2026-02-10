import { FieldDef } from './field-def';
import { FieldMeta } from './field-meta';
import { FieldWithValidation } from './field-with-validation';
import { WithInputSignals } from '../../models/component-type';
import { Prettify } from '../../models/prettify';
import { DynamicText } from '../../models/types/dynamic-text';

/**
 * Supported primitive value types for form fields.
 * This type represents all possible value types that can be used in form fields.
 */
export type ValueType = string | number | boolean | Date | object | unknown[];

export interface BaseValueField<TProps, TValue, TMeta extends FieldMeta = FieldMeta> extends FieldDef<TProps, TMeta>, FieldWithValidation {
  value?: TValue;

  /**
   * Placeholder text displayed when the field is empty.
   * Supports static strings, Observables, and Signals for dynamic content.
   */
  placeholder?: DynamicText;

  required?: boolean;
}

export function isValueField<TProps, TMeta extends FieldMeta = FieldMeta>(
  field: FieldDef<TProps, TMeta>,
): field is BaseValueField<TProps, ValueType, TMeta> {
  return 'value' in field;
}

type ExcludedKeys =
  | 'type'
  | 'conditionals'
  | 'value'
  | 'valueType'
  | 'disabled'
  | 'readonly'
  | 'hidden'
  | 'col'
  | 'minValue'
  | 'maxValue'
  | 'step'
  // Exclude validation config, but keep validationMessages for component use
  | 'required'
  | 'email'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'validators'
  | 'logic'
  | 'derivation'
  | 'schemas'
  // Value exclusion config (submission-only, not component inputs)
  | 'excludeValueIfHidden'
  | 'excludeValueIfDisabled'
  | 'excludeValueIfReadonly';
// Note: 'meta' is NOT excluded - components must handle meta attributes

export type ValueFieldComponent<T extends BaseValueField<Record<string, unknown> | unknown, unknown>> = Prettify<
  WithInputSignals<Omit<T, ExcludedKeys>>
>;
