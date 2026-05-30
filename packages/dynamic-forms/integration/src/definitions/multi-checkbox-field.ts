import { BaseValueField, FieldMeta, FieldOption } from '@ng-forge/dynamic-forms/internal';

/**
 * Multi-checkbox field for selecting multiple values from a list of options.
 * The value is an array of selected option values.
 */
export interface MultiCheckboxField<TValue, TProps = object, TNullable extends boolean = boolean> extends BaseValueField<
  TProps,
  TValue[],
  FieldMeta,
  TNullable
> {
  type: 'multi-checkbox';
  readonly options: readonly FieldOption<TValue>[];
}
