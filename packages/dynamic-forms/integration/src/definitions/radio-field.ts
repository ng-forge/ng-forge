import { BaseValueField, FieldOption } from '@ng-forge/dynamic-forms';

export interface RadioField<T, TProps> extends BaseValueField<TProps, T> {
  type: 'radio';
  readonly options: readonly FieldOption<T>[];
}
