import { BaseValueField, FieldMeta, FieldOption } from '@ng-forge/dynamic-forms';

export interface RadioField<T, TProps, TNullable extends boolean = false> extends BaseValueField<TProps, T, FieldMeta, TNullable> {
  type: 'radio';
  readonly options: readonly FieldOption<T>[];
}
