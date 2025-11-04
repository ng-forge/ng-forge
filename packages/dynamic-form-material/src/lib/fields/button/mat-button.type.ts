import { ButtonField, FieldComponent, FormEvent } from '@ng-forge/dynamic-form';

export interface MatButtonProps extends Record<string, unknown> {
  color?: 'primary' | 'accent' | 'warn';
  type?: 'button' | 'submit' | 'reset';
}

export type MatButtonField<TEvent extends FormEvent> = ButtonField<MatButtonProps, TEvent>;
export type MatButtonComponent<TEvent extends FormEvent> = FieldComponent<MatButtonField<TEvent>>;
