import { BaseValueField, FieldMeta, FieldOption } from '@ng-forge/dynamic-forms';

/**
 * Base props for select fields. Intentionally empty — adapter libraries
 * extend this with adapter-specific options (styleClass, size, appearance, etc.).
 */
export type SelectProps = object;

export interface SelectField<T, TProps = SelectProps, TNullable extends boolean = boolean> extends BaseValueField<
  TProps,
  T,
  FieldMeta,
  TNullable
> {
  type: 'select';
  readonly options: readonly FieldOption<T>[];
}
