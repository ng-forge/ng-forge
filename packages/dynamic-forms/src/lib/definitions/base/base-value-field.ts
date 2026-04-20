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

export interface BaseValueField<TProps, TValue, TMeta extends FieldMeta = FieldMeta, TNullable extends boolean = false>
  extends FieldDef<TProps, TMeta>, FieldWithValidation {
  value?: TNullable extends true ? TValue | null : TValue;

  /**
   * Placeholder text displayed when the field is empty.
   * Supports static strings, Observables, and Signals for dynamic content.
   */
  placeholder?: DynamicText;

  required?: boolean;

  /**
   * Whether the field accepts `null` as a valid value.
   *
   * When `true`, `value` may be `null` and an omitted `value` resolves to `null`
   * (rather than the type-specific empty default). Orthogonal to `required`.
   *
   * Read-side caveat: a user clearing a text input reads back as `""`, not `null`
   * — this matches classic Reactive Forms and is enforced by the Web IDL contract.
   * `nullable` is a contract for accepted values, not a guarantee of emitted ones.
   *
   * @default false
   */
  nullable?: TNullable;
}

export function isValueField<TProps, TMeta extends FieldMeta = FieldMeta>(
  field: FieldDef<TProps, TMeta>,
): field is BaseValueField<TProps, ValueType, TMeta, boolean> {
  return 'value' in field;
}

type ExcludedKeys =
  | 'type'
  | 'conditionals'
  | 'value'
  | 'valueType'
  | 'nullable'
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

export type ValueFieldComponent<T extends BaseValueField<Record<string, unknown> | unknown, unknown, FieldMeta, boolean>> = Prettify<
  WithInputSignals<Omit<T, ExcludedKeys>>
>;
