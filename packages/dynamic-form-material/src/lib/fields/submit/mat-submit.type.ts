import { SubmitField, UnwrapField } from '@ng-forge/dynamic-form';
import { InputSignal } from '@angular/core';

export interface MatSubmitField extends SubmitField {
  color: InputSignal<'primary' | 'accent' | 'warn'>;
}

export type MatSubmitProps = UnwrapField<MatSubmitField>;
