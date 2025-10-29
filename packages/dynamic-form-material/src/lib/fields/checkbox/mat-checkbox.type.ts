import { CheckboxField, CheckedFieldComponent } from '@ng-forge/dynamic-form';

export interface MatCheckboxProps extends Record<string, unknown> {
  color?: 'primary' | 'accent' | 'warn';
  disableRipple?: boolean;
  labelPosition?: 'before' | 'after';
  hint?: string;
  indeterminate?: boolean;
}

export type MatCheckboxField = CheckboxField<MatCheckboxProps>;

export type MatCheckboxComponent = CheckedFieldComponent<MatCheckboxField>;
