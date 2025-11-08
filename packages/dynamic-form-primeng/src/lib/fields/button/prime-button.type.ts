import { ButtonField, FieldComponent, FieldDef, FormEvent } from '@ng-forge/dynamic-form';

export interface PrimeButtonProps {
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
  text?: boolean;
  outlined?: boolean;
  raised?: boolean;
  rounded?: boolean;
  icon?: string;
  iconPos?: 'left' | 'right' | 'top' | 'bottom';
  type?: 'button' | 'submit' | 'reset';
}

export type PrimeButtonField<TEvent extends FormEvent = FormEvent> = ButtonField<PrimeButtonProps, TEvent>;
export type PrimeButtonComponent<TEvent extends FormEvent = FormEvent> = FieldComponent<PrimeButtonField<TEvent>>;

/**
 * Specific button field types with preconfigured events
 */

/** Submit button field - automatically disabled when form is invalid */
export interface PrimeSubmitButtonField extends Omit<FieldDef<PrimeButtonProps>, 'event'> {
  type: 'submit';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: PrimeButtonProps;
}

/** Next page button field - with preconfigured NextPageEvent */
export interface PrimeNextButtonField extends Omit<FieldDef<PrimeButtonProps>, 'event'> {
  type: 'next';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: PrimeButtonProps;
}

/** Previous page button field - with preconfigured PreviousPageEvent */
export interface PrimePreviousButtonField extends Omit<FieldDef<PrimeButtonProps>, 'event'> {
  type: 'previous';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: PrimeButtonProps;
}
