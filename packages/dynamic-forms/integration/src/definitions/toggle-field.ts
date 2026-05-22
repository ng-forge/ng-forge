import { BaseCheckedField, FieldMeta } from '@ng-forge/dynamic-forms';

export interface ToggleField<TProps, TNullable extends boolean = boolean> extends BaseCheckedField<TProps, FieldMeta, TNullable> {
  type: 'toggle';
}
