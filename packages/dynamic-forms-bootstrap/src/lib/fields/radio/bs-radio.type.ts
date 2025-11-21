import { DynamicText, RadioField, ValueFieldComponent } from '@ng-forge/dynamic-forms';

export interface BsRadioProps {
  inline?: boolean;
  reverse?: boolean;
  buttonGroup?: boolean;
  buttonSize?: 'sm' | 'lg';
  helpText?: DynamicText;
}

export type BsRadioField<T> = RadioField<T, BsRadioProps>;

export type BsRadioComponent<T> = ValueFieldComponent<BsRadioField<T>>;
