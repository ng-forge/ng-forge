import { FieldComponent, SubmitField } from '@ng-forge/dynamic-form';

export interface MatSubmitProps extends Record<string, unknown> {
  color: 'primary' | 'accent' | 'warn';
}

export type MatSubmitField = SubmitField<MatSubmitProps>;
export type MatSubmitComponent = FieldComponent<MatSubmitField>;
