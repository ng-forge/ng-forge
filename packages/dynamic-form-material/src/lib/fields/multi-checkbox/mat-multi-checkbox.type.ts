import { MultiCheckboxField, ValueFieldComponent, ValueType } from '@ng-forge/dynamic-form';

export interface MatMultiCheckboxProps extends Record<string, unknown> {
  disableRipple?: boolean;
  tabIndex?: number;
  hint?: string;
}

export type MatMultiCheckboxField<T extends ValueType> = MultiCheckboxField<T, MatMultiCheckboxProps>;

export type MatMultiCheckboxComponent<T extends ValueType> = ValueFieldComponent<MatMultiCheckboxField<T>>;
