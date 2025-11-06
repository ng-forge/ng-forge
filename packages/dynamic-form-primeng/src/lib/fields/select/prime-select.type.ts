import { SelectField, ValueFieldComponent } from '@ng-forge/dynamic-form';
import { PrimeSelectProps as PrimeSelectPropsType } from '../../types/registry-augmentation';

export type PrimeSelectProps<T> = PrimeSelectPropsType<T>;
export type PrimeSelectField<T> = SelectField<T, PrimeSelectProps<T>>;

export type PrimeSelectComponent<T> = ValueFieldComponent<PrimeSelectField<T>>;
