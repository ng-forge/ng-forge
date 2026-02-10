import { FieldDef } from './field-def';
import { FieldMeta } from './field-meta';
import { FieldWithValidation } from './field-with-validation';
import { WithInputSignals } from '../../models/component-type';
import { Prettify } from '../../models/prettify';
import { DynamicText } from '../../models/types/dynamic-text';

export interface BaseCheckedField<TProps, TMeta extends FieldMeta = FieldMeta> extends FieldDef<TProps, TMeta>, FieldWithValidation {
  value?: boolean;

  /**
   * Placeholder text displayed when the field is empty.
   * Supports static strings, Observables, and Signals for dynamic content.
   */
  placeholder?: DynamicText;

  required?: boolean;
}

export function isCheckedField<TProps, TMeta extends FieldMeta = FieldMeta>(
  field: FieldDef<TProps, TMeta>,
): field is BaseCheckedField<TProps, TMeta> {
  return field.type === 'checkbox';
}

// Note: 'meta' is NOT excluded - components must handle meta attributes
type ExcludedKeys =
  | 'type'
  | 'conditionals'
  | 'value'
  | 'disabled'
  | 'readonly'
  | 'hidden'
  | 'col'
  | keyof FieldWithValidation
  // Value exclusion config (submission-only, not component inputs)
  | 'excludeValueIfHidden'
  | 'excludeValueIfDisabled'
  | 'excludeValueIfReadonly';

export type CheckedFieldComponent<T extends BaseCheckedField<Record<string, unknown> | unknown>> = Prettify<
  WithInputSignals<Omit<T, ExcludedKeys>>
>;
