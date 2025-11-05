import { DynamicText, RadioField, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface BsRadioProps<T> extends Record<string, unknown> {
  inline?: boolean;
  reverse?: boolean;
  buttonGroup?: boolean;
  buttonSize?: 'sm' | 'lg';
  helpText?: DynamicText;
}

export type BsRadioField<T> = RadioField<T, BsRadioProps<T>>;

export type BsRadioComponent<T> = ValueFieldComponent<BsRadioField<T>>;
