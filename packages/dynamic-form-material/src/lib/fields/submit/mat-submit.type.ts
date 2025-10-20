import { FieldType, SubmitField } from '@ng-forge/dynamic-form';

export interface MatSubmitProps extends SubmitField {
  color: 'primary' | 'accent' | 'warn';
}

export type MatSubmitField = FieldType<MatSubmitProps>;
