import { BaseValueField, FieldOption } from '@ng-forge/dynamic-forms';

/**
 * Base props for select fields. Intentionally empty — adapter libraries
 * extend this with adapter-specific options (styleClass, size, appearance, etc.).
 */
export type SelectProps = object;

export interface SelectField<T, TProps = SelectProps> extends BaseValueField<TProps, T> {
  type: 'select';
  readonly options: readonly FieldOption<T>[];
}
